using System.Net;
using Auditor.Agent.Core;
using Auditor.Agent.Core.Api;
using Auditor.Agent.Core.Local;
using Auditor.Agent.Core.Sync;
using Auditor.Agent.Shared;
using Xunit;

namespace Auditor.Agent.Tests;

public class P2SyncTests : IDisposable
{
    private readonly string _path = Path.Combine(Path.GetTempPath(), $"p2-{Guid.NewGuid():N}.db");

    private static (HttpStatusCode, string) Route(HttpRequestMessage r)
    {
        var p = r.RequestUri!.AbsolutePath;
        if (p.EndsWith("/sync/ping")) return (HttpStatusCode.OK, """{"ok":true}""");
        if (p.EndsWith("/sync/start")) return (HttpStatusCode.OK, """{"ok":true,"sessionId":"s1"}""");
        if (p.EndsWith("/findings/sync")) return (HttpStatusCode.OK, """{"ok":true,"created":1,"skipped":0,"findingIds":["F-1"]}""");
        if (p.EndsWith("/evidences/upload")) return (HttpStatusCode.OK, """{"ok":true,"id":"ev1"}""");
        if (p.EndsWith("/status")) return (HttpStatusCode.OK, """{"ok":true,"status":"done"}""");
        if (p.EndsWith("/sync/complete")) return (HttpStatusCode.OK, """{"ok":true}""");
        return (HttpStatusCode.NotFound, """{"ok":false}""");
    }

    [Fact]
    public async Task Pushes_findings_evidence_and_task_status()
    {
        using var store = new LocalStore(_path);
        store.EnqueueFinding(new QueuedFinding
        {
            Input = new FindingSyncInput("key-0001", "T-1", "t", "high", 7, "CWE-1", "h", "web", "d"),
        });
        store.AddEvidence(new QueuedEvidence { Id = "e1", Filename = "shot.png", Mime = "image/png", SizeBytes = 3, FindingKey = "key-0001" }, new byte[] { 1, 2, 3 });
        store.EnqueueTaskStatus("T-1", "done");

        var handler = new StubHandler(Route);
        var engine = new SyncEngine(new AgentApiClient(handler.Client()), store);

        var r = await engine.SyncAsync();

        Assert.True(r.Online);
        Assert.Equal(1, r.Created);
        Assert.Equal(1, r.EvidenceSent);
        Assert.Equal(1, r.TasksSent);
        Assert.Equal(0, r.StillPending);
        Assert.Empty(store.GetEvidence(SyncState.Pending));
        Assert.Empty(store.GetTaskStatusQueue(SyncState.Pending));
        // The multipart upload + status calls were actually made.
        Assert.Contains(handler.Requests, x => x.RequestUri!.AbsolutePath.EndsWith("/evidences/upload"));
        Assert.Contains(handler.Requests, x => x.RequestUri!.AbsolutePath.EndsWith("/status"));
    }

    [Fact]
    public async Task Evidence_only_still_opens_a_session_and_uploads()
    {
        using var store = new LocalStore(_path);
        store.AddEvidence(new QueuedEvidence { Id = "e1", Filename = "a.txt", SizeBytes = 1 }, new byte[] { 9 });

        var handler = new StubHandler(Route);
        var engine = new SyncEngine(new AgentApiClient(handler.Client()), store);

        var r = await engine.SyncAsync();
        Assert.Equal(1, r.EvidenceSent);
        Assert.Equal(0, r.Created);
    }

    [Fact]
    public async Task Failed_evidence_upload_leaves_it_failed_not_pending()
    {
        using var store = new LocalStore(_path);
        store.AddEvidence(new QueuedEvidence { Id = "e1", Filename = "a.txt", SizeBytes = 1 }, new byte[] { 9 });

        var handler = new StubHandler(r =>
            r.RequestUri!.AbsolutePath.EndsWith("/evidences/upload")
                ? (HttpStatusCode.BadRequest, """{"ok":false,"error":"invalid"}""")
                : Route(r));
        var engine = new SyncEngine(new AgentApiClient(handler.Client()), store);

        var r = await engine.SyncAsync();
        Assert.Equal(0, r.EvidenceSent);
        Assert.Empty(store.GetEvidence(SyncState.Pending));
        Assert.Single(store.GetEvidence(SyncState.Failed));
    }

    public void Dispose() { try { if (File.Exists(_path)) File.Delete(_path); } catch (IOException) { } }
}

public class P2ApiClientTests
{
    [Fact]
    public async Task UpdateTaskStatus_posts_target_status()
    {
        var handler = new StubHandler(_ => (HttpStatusCode.OK, """{"ok":true,"status":"done"}"""));
        var api = new AgentApiClient(handler.Client());
        api.SetToken("jwt");
        var res = await api.UpdateTaskStatusAsync("T-1", "done");
        Assert.True(res is { Ok: true });
        Assert.Contains("\"toStatus\"", handler.Bodies[0]);
        Assert.EndsWith("/api/v1/agent/tasks/T-1/status", handler.Requests[0].RequestUri!.AbsolutePath);
    }

    [Fact]
    public async Task UploadEvidence_sends_multipart_with_bearer()
    {
        var handler = new StubHandler(_ => (HttpStatusCode.OK, """{"ok":true,"id":"ev1"}"""));
        var api = new AgentApiClient(handler.Client());
        api.SetToken("jwt-abc");
        var res = await api.UploadEvidenceAsync(new byte[] { 1, 2 }, "x.png", "image/png", "key-1");
        Assert.True(res is { Ok: true, Id: "ev1" });
        var req = handler.Requests[0];
        Assert.Equal("jwt-abc", req.Headers.Authorization!.Parameter);
        Assert.Contains("multipart/form-data", req.Content!.Headers.ContentType!.MediaType);
    }

    [Fact]
    public async Task Revoke_posts_to_revoke_endpoint()
    {
        var handler = new StubHandler(_ => (HttpStatusCode.OK, """{"ok":true}"""));
        var api = new AgentApiClient(handler.Client());
        api.SetToken("jwt");
        var res = await api.RevokeTokenAsync();
        Assert.True(res is { Ok: true });
        Assert.EndsWith("/api/v1/agent/token/revoke", handler.Requests[0].RequestUri!.AbsolutePath);
    }

    [Fact]
    public async Task Upload_reports_progress_reaching_100()
    {
        var handler = new StubHandler(_ => (HttpStatusCode.OK, """{"ok":true,"id":"e"}"""));
        var api = new AgentApiClient(handler.Client());
        api.SetToken("jwt");
        var reports = new List<int>();
        await api.UploadEvidenceAsync(new byte[100_000], "big.bin", "application/octet-stream", "k",
            new DelegateProgress<int>(reports.Add));
        Assert.Contains(100, reports);
        Assert.True(reports.Count >= 2, "expected chunked progress reports");
    }
}

public class AgentServiceSyncAuthTests : IDisposable
{
    private readonly string _path = Path.Combine(Path.GetTempPath(), $"svc-auth-{Guid.NewGuid():N}.db");

    [Fact]
    public async Task Sync_auth_failure_clears_only_audit_session_and_preserves_queue()
    {
        using var store = new LocalStore(_path);
        store.SaveSession("stale-jwt", new AuditContext("AUD-1", "AUD-1", "Audit", "Org", "Lead"));
        store.SaveCredential("cached-login");
        store.EnqueueFinding(new QueuedFinding
        {
            Input = new FindingSyncInput("key-0001", "T-1", "t", "high", 7, "CWE-1", "h", "web", "d"),
        });

        var handler = new StubHandler(r =>
        {
            var p = r.RequestUri!.AbsolutePath;
            if (p.EndsWith("/sync/ping")) return (HttpStatusCode.OK, """{"ok":true}""");
            if (p.EndsWith("/sync/start")) return (HttpStatusCode.Unauthorized, """{"ok":false,"error":"token_not_found"}""");
            return (HttpStatusCode.OK, """{"ok":true}""");
        });
        using var service = new AgentService(
            new AgentSettings { DbPath = _path, BaseUrl = "http://test.local" },
            new AgentApiClient(handler.Client()),
            store);

        var result = await service.SyncAsync();

        Assert.True(result.RequiresReauth);
        Assert.Equal("token_not_found", result.Error);
        Assert.False(service.IsAudited);
        Assert.Null(store.GetSessionToken());
        Assert.Null(store.GetAuditContext());
        Assert.Equal("cached-login", store.GetCredential());
        Assert.Single(store.GetFindings(SyncState.Pending));
    }

    public void Dispose() { try { if (File.Exists(_path)) File.Delete(_path); } catch (IOException) { } }
}

public class P2ProgressTests : IDisposable
{
    private readonly string _path = Path.Combine(Path.GetTempPath(), $"prog-{Guid.NewGuid():N}.db");

    [Fact]
    public async Task Sync_reports_a_synced_progress_for_a_queued_item()
    {
        using var store = new LocalStore(_path);
        store.EnqueueTaskStatus("T-1", "done");
        var handler = new StubHandler(r =>
        {
            var p = r.RequestUri!.AbsolutePath;
            if (p.EndsWith("/sync/ping")) return (HttpStatusCode.OK, """{"ok":true}""");
            if (p.EndsWith("/sync/start")) return (HttpStatusCode.OK, """{"ok":true,"sessionId":"s"}""");
            if (p.EndsWith("/status")) return (HttpStatusCode.OK, """{"ok":true,"status":"done"}""");
            return (HttpStatusCode.OK, """{"ok":true}""");
        });
        var engine = new SyncEngine(new AgentApiClient(handler.Client()), store);

        var reports = new List<SyncProgress>();
        await engine.SyncAsync(new DelegateProgress<SyncProgress>(reports.Add));
        Assert.Contains(reports, x => x.Key == "T-1" && x.State == "synced" && x.Percent == 100);
    }

    public void Dispose() { try { if (File.Exists(_path)) File.Delete(_path); } catch (IOException) { } }
}
