using Auditor.Agent.Core;
using Xunit;

namespace Auditor.Agent.Tests;

/// <summary>
/// Opt-in end-to-end against a running dev server (proves the .NET client matches the
/// real JSON contract, not just the stub). Skipped unless AGENT_E2E=1.
/// Required env: AGENT_E2E_TOKEN (a valid, non-expired audit token).
/// Optional: AGENT_E2E_URL (default http://localhost:3000).
/// </summary>
public class LiveIntegrationTests : IDisposable
{
    private readonly string _db = Path.Combine(Path.GetTempPath(), $"live-{Guid.NewGuid():N}.db");

    [Fact]
    public async Task Validate_load_capture_sync_against_live_server()
    {
        if (Environment.GetEnvironmentVariable("AGENT_E2E") != "1") return; // skipped by default
        var token = Environment.GetEnvironmentVariable("AGENT_E2E_TOKEN")
                    ?? throw new InvalidOperationException("set AGENT_E2E_TOKEN");
        var url = Environment.GetEnvironmentVariable("AGENT_E2E_URL") ?? "http://localhost:3000";

        using var svc = new AgentService(new AgentSettings { BaseUrl = url, DbPath = _db });

        Assert.True(await svc.PingAsync(), "server not reachable");

        var validate = await svc.ValidateTokenAsync(token);
        Assert.True(validate is { Ok: true }, $"validate failed: {validate?.Error}");
        Assert.NotNull(svc.Context);

        var tasks = await svc.LoadTasksAsync();
        Assert.NotEmpty(tasks);

        svc.CaptureFinding(tasks[0].Id, "Live e2e finding", "medium", 5.5,
            "CWE-284", "live-asset", "manual", "created by AGENT_E2E");

        var res = await svc.SyncAsync();
        Assert.True(res.Online);
        Assert.True(res.Created >= 1, $"expected a created finding, got created={res.Created} err={res.Error}");
    }

    [Fact]
    public async Task Captures_and_uploads_evidence_against_live_server()
    {
        if (Environment.GetEnvironmentVariable("AGENT_E2E") != "1") return; // skipped by default
        var token = Environment.GetEnvironmentVariable("AGENT_E2E_TOKEN")
                    ?? throw new InvalidOperationException("set AGENT_E2E_TOKEN");
        var url = Environment.GetEnvironmentVariable("AGENT_E2E_URL") ?? "http://localhost:3000";

        using var svc = new AgentService(new AgentSettings { BaseUrl = url, DbPath = _db });
        Assert.True(await svc.PingAsync(), "server not reachable");
        Assert.True((await svc.ValidateTokenAsync(token)) is { Ok: true }, "validate failed");

        var tasks = await svc.LoadTasksAsync();
        Assert.NotEmpty(tasks);

        var finding = svc.CaptureFinding(tasks[0].Id, "Evidence e2e finding", "high", 7.5,
            "CWE-284", "evidence-asset", "manual", "finding with an attached file");

        // a real file on disk → captured (encrypted) → uploaded as bytea on sync
        var file = Path.Combine(Path.GetTempPath(), $"evidence-{Guid.NewGuid():N}.txt");
        File.WriteAllText(file, "tcpdump line 1\ntcpdump line 2\n");
        try
        {
            svc.CaptureEvidence(finding.IdempotencyKey, file);

            var res = await svc.SyncAsync();
            Assert.True(res.Online);
            Assert.True(res.Created >= 1, $"finding not created: created={res.Created} err={res.Error}");
            Assert.True(res.EvidenceSent >= 1, $"evidence not uploaded: sent={res.EvidenceSent} err={res.Error}");
        }
        finally { try { File.Delete(file); } catch (IOException) { } }
    }

    public void Dispose()
    {
        try { if (File.Exists(_db)) File.Delete(_db); } catch (IOException) { }
    }
}
