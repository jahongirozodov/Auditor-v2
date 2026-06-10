using System.Net;
using Auditor.Agent.Core.Api;
using Auditor.Agent.Core.Local;
using Auditor.Agent.Core.Sync;
using Auditor.Agent.Shared;
using Xunit;

namespace Auditor.Agent.Tests;

public class SyncEngineTests : IDisposable
{
    private readonly string _path = Path.Combine(Path.GetTempPath(), $"sync-test-{Guid.NewGuid():N}.db");

    private LocalStore NewStoreWith(int pending)
    {
        var s = new LocalStore(_path);
        for (var i = 0; i < pending; i++)
            s.EnqueueFinding(new QueuedFinding
            {
                Input = new FindingSyncInput($"key-{i:D8}", "T-1", "t", "high", 7.0, "CWE-89", "h", "web", "d"),
            });
        return s;
    }

    private static (HttpStatusCode, string) Route(HttpRequestMessage r, string findingsBody)
    {
        var p = r.RequestUri!.AbsolutePath;
        if (p.EndsWith("/sync/ping")) return (HttpStatusCode.OK, """{"ok":true}""");
        if (p.EndsWith("/sync/start")) return (HttpStatusCode.OK, """{"ok":true,"sessionId":"s1"}""");
        if (p.EndsWith("/findings/sync")) return (HttpStatusCode.OK, findingsBody);
        if (p.EndsWith("/sync/complete")) return (HttpStatusCode.OK, """{"ok":true}""");
        return (HttpStatusCode.NotFound, """{"ok":false}""");
    }

    [Fact]
    public async Task Offline_when_ping_fails()
    {
        using var store = NewStoreWith(1);
        var handler = new StubHandler(_ => (HttpStatusCode.ServiceUnavailable, """{"ok":false}"""));
        var engine = new SyncEngine(new AgentApiClient(handler.Client()), store);

        var res = await engine.SyncAsync();
        Assert.False(res.Online);
        Assert.Equal(SyncState.Pending, store.GetFindings().Single().State); // untouched
    }

    [Fact]
    public async Task Pushes_pending_and_marks_synced()
    {
        using var store = NewStoreWith(2);
        var handler = new StubHandler(r => Route(r, """{"ok":true,"created":2,"skipped":0,"findingIds":["F-1","F-2"]}"""));
        var engine = new SyncEngine(new AgentApiClient(handler.Client()), store);

        var res = await engine.SyncAsync();
        Assert.True(res.Online);
        Assert.Equal(2, res.Created);
        Assert.Equal(0, res.StillPending);
        Assert.All(store.GetFindings(), f => Assert.Equal(SyncState.Synced, f.State));
        // The whole lifecycle was driven: ping, start, findings, complete.
        Assert.Contains(handler.Requests, x => x.RequestUri!.AbsolutePath.EndsWith("/sync/complete"));
    }

    [Fact]
    public async Task Idempotent_resync_reports_skipped_no_duplicates()
    {
        using var store = NewStoreWith(2);
        var handler = new StubHandler(r => Route(r, """{"ok":true,"created":0,"skipped":2,"findingIds":[]}"""));
        var engine = new SyncEngine(new AgentApiClient(handler.Client()), store);

        var res = await engine.SyncAsync();
        Assert.True(res.Online);
        Assert.Equal(0, res.Created);
        Assert.Equal(2, res.Skipped); // server already had them
        Assert.All(store.GetFindings(), f => Assert.Equal(SyncState.Synced, f.State));
    }

    [Fact]
    public async Task Marks_failed_when_server_rejects_findings()
    {
        using var store = NewStoreWith(1);
        var handler = new StubHandler(r =>
            r.RequestUri!.AbsolutePath.EndsWith("/findings/sync")
                ? (HttpStatusCode.Forbidden, """{"ok":false,"error":"task_scope"}""")
                : Route(r, ""));
        var engine = new SyncEngine(new AgentApiClient(handler.Client()), store);

        var res = await engine.SyncAsync();
        Assert.Equal("task_scope", res.Error);
        Assert.False(res.RequiresReauth);
        Assert.Equal(SyncState.Failed, store.GetFindings().Single().State);
    }

    [Theory]
    [InlineData(HttpStatusCode.Unauthorized, "token_not_found")]
    [InlineData(HttpStatusCode.Forbidden, "token_inactive")]
    public async Task Auth_failure_on_sync_start_requires_reauth_and_keeps_pending(
        HttpStatusCode status,
        string error)
    {
        using var store = NewStoreWith(1);
        var handler = new StubHandler(r =>
        {
            var p = r.RequestUri!.AbsolutePath;
            if (p.EndsWith("/sync/ping")) return (HttpStatusCode.OK, """{"ok":true}""");
            if (p.EndsWith("/sync/start")) return (status, $$"""{"ok":false,"error":"{{error}}"}""");
            return (HttpStatusCode.OK, """{"ok":true}""");
        });
        var engine = new SyncEngine(new AgentApiClient(handler.Client()), store);

        var res = await engine.SyncAsync();

        Assert.True(res.Online);
        Assert.True(res.RequiresReauth);
        Assert.Equal(error, res.Error);
        Assert.Single(store.GetFindings(SyncState.Pending));
        Assert.Empty(store.GetFindings(SyncState.Failed));
        Assert.DoesNotContain(handler.Requests, x => x.RequestUri!.AbsolutePath.EndsWith("/findings/sync"));
    }

    [Fact]
    public async Task Nothing_to_sync_is_a_clean_noop()
    {
        using var store = NewStoreWith(0);
        var handler = new StubHandler(_ => (HttpStatusCode.OK, """{"ok":true}"""));
        var engine = new SyncEngine(new AgentApiClient(handler.Client()), store);

        var res = await engine.SyncAsync();
        Assert.True(res.Online);
        Assert.Equal(0, res.Created);
    }

    public void Dispose()
    {
        try { if (File.Exists(_path)) File.Delete(_path); } catch (IOException) { }
    }
}

public class ApiClientTests
{
    [Fact]
    public async Task Sends_bearer_after_SetToken()
    {
        var handler = new StubHandler(_ => (HttpStatusCode.OK, """{"ok":true,"tasks":[]}"""));
        var api = new AgentApiClient(handler.Client());
        api.SetToken("jwt-abc");

        await api.GetMyTasksAsync("AUD-1");
        var auth = handler.Requests.Single().Headers.Authorization;
        Assert.Equal("Bearer", auth!.Scheme);
        Assert.Equal("jwt-abc", auth.Parameter);
    }

    [Fact]
    public async Task Serializes_request_body_as_camelCase()
    {
        var handler = new StubHandler(_ => (HttpStatusCode.OK, """{"ok":true,"created":1,"skipped":0,"findingIds":["F-1"]}"""));
        var api = new AgentApiClient(handler.Client());
        api.SetToken("jwt");

        await api.SyncFindingsAsync(new FindingsSyncRequest(
            [new FindingSyncInput("key-00000001", "T-1", "t", "high", 7.0, "CWE-89", "h", "web", "d")]));

        Assert.Contains("\"idempotencyKey\"", handler.Bodies[0]);
        Assert.Contains("\"taskId\"", handler.Bodies[0]);
    }
}
