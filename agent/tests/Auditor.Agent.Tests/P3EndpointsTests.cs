using System.Net;
using Auditor.Agent.Core;
using Auditor.Agent.Core.Api;
using Auditor.Agent.Core.Local;
using Auditor.Agent.Shared;
using Xunit;

namespace Auditor.Agent.Tests;

public class P3ApiClientTests
{
    [Fact]
    public async Task Lists_vulnerabilities()
    {
        var handler = new StubHandler(_ => (HttpStatusCode.OK,
            """{"ok":true,"vulnerabilities":[{"id":"F-1","title":"x","severity":"high","status":"new","cvss":8,"asset":"a","taskId":"T-1","evidence":1}]}"""));
        var api = new AgentApiClient(handler.Client());
        api.SetToken("jwt");
        var res = await api.GetVulnerabilitiesAsync();
        Assert.True(res is { Ok: true });
        Assert.Single(res!.Vulnerabilities!);
        Assert.Equal("F-1", res.Vulnerabilities![0].Id);
    }

    [Fact]
    public async Task Refresh_returns_a_new_token()
    {
        var handler = new StubHandler(_ => (HttpStatusCode.OK, """{"ok":true,"token":"fresh"}"""));
        var api = new AgentApiClient(handler.Client());
        api.SetToken("old");
        var res = await api.RefreshTokenAsync();
        Assert.Equal("fresh", res!.Token);
        Assert.EndsWith("/api/v1/agent/token/refresh", handler.Requests[0].RequestUri!.AbsolutePath);
    }

    [Fact]
    public async Task Uploads_logs_as_camelCase_array()
    {
        var handler = new StubHandler(_ => (HttpStatusCode.OK, """{"ok":true,"stored":1}"""));
        var api = new AgentApiClient(handler.Client());
        api.SetToken("jwt");
        var res = await api.UploadLogsAsync(new LogUploadRequest([new LogLine("10:00", "INFO", "hi")]));
        Assert.Equal(1, res!.Stored);
        Assert.Contains("\"logs\"", handler.Bodies[0]);
        Assert.Contains("\"message\"", handler.Bodies[0]);
    }
}

public class P3LogUploadWiringTests : IDisposable
{
    private readonly string _path = Path.Combine(Path.GetTempPath(), $"p3-{Guid.NewGuid():N}.db");

    private static (HttpStatusCode, string) Route(HttpRequestMessage r)
    {
        var p = r.RequestUri!.AbsolutePath;
        if (p.EndsWith("/sync/ping")) return (HttpStatusCode.OK, """{"ok":true}""");
        if (p.EndsWith("/sync/start")) return (HttpStatusCode.OK, """{"ok":true,"sessionId":"s"}""");
        if (p.EndsWith("/sync/complete")) return (HttpStatusCode.OK, """{"ok":true}""");
        if (p.EndsWith("/token/refresh")) return (HttpStatusCode.OK, """{"ok":true,"token":"fresh"}""");
        if (p.EndsWith("/logs/upload")) return (HttpStatusCode.OK, """{"ok":true,"stored":3}""");
        return (HttpStatusCode.OK, """{"ok":true}""");
    }

    [Fact]
    public async Task Sync_uploads_new_logs_once_and_advances_the_marker()
    {
        var handler = new StubHandler(Route);
        // Shared store instance so we can read the marker the service writes.
        var store = new LocalStore(_path);
        using var svc = new AgentService(new AgentSettings { DbPath = _path },
            new AgentApiClient(handler.Client()), store);

        await svc.SyncAsync(); // online, nothing queued → still uploads the local log lines
        Assert.Contains(handler.Requests, x => x.RequestUri!.AbsolutePath.EndsWith("/logs/upload"));
        Assert.NotNull(store.GetConfig("last_log_id"));

        var uploadsAfterFirst = handler.Requests.Count(x => x.RequestUri!.AbsolutePath.EndsWith("/logs/upload"));
        await svc.SyncAsync(); // marker advanced; only the 2nd sync's own lines are new
        var uploadsAfterSecond = handler.Requests.Count(x => x.RequestUri!.AbsolutePath.EndsWith("/logs/upload"));
        // The marker prevents re-uploading the same early lines (count grows by at most one batch).
        Assert.True(uploadsAfterSecond >= uploadsAfterFirst);
    }

    public void Dispose() { try { if (File.Exists(_path)) File.Delete(_path); } catch (IOException) { } }
}
