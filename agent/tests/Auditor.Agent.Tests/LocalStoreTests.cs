using Auditor.Agent.Core.Local;
using Auditor.Agent.Shared;
using Xunit;

namespace Auditor.Agent.Tests;

public class LocalStoreTests : IDisposable
{
    private readonly string _path = Path.Combine(Path.GetTempPath(), $"agent-test-{Guid.NewGuid():N}.db");

    private LocalStore Open() => new(_path);

    private static FindingSyncInput Finding(string key, string sev = "high") =>
        new(key, "T-1", "Title " + key, sev, 8.1, "CWE-89", "host", "web", "desc");

    [Fact]
    public void Enqueues_and_reads_back_findings_decrypted()
    {
        using var s = Open();
        s.EnqueueFinding(new QueuedFinding { Input = Finding("aaaaaaaa") });
        var all = s.GetFindings();
        Assert.Single(all);
        Assert.Equal("Title aaaaaaaa", all[0].Input.Title);
        Assert.Equal(SyncState.Pending, all[0].State);
    }

    [Fact]
    public void State_transitions_and_counts()
    {
        using var s = Open();
        s.EnqueueFinding(new QueuedFinding { Input = Finding("aaaaaaaa") });
        s.EnqueueFinding(new QueuedFinding { Input = Finding("bbbbbbbb") });
        s.SetFindingState("aaaaaaaa", SyncState.Synced);

        Assert.Single(s.GetFindings(SyncState.Pending));
        var (pending, synced, failed) = s.Counts();
        Assert.Equal((1, 1, 0), (pending, synced, failed));
    }

    [Fact]
    public void Encrypted_at_rest_plaintext_absent_from_file()
    {
        using (var s = Open())
            s.EnqueueFinding(new QueuedFinding { Input = Finding("aaaaaaaa") with { Title = "SENSITIVE-MARKER" } });
        var bytes = File.ReadAllBytes(_path);
        Assert.DoesNotContain("SENSITIVE-MARKER", System.Text.Encoding.UTF8.GetString(bytes));
    }

    [Fact]
    public void Persists_across_reopen_with_stable_key()
    {
        using (var s = Open())
            s.EnqueueFinding(new QueuedFinding { Input = Finding("aaaaaaaa") });
        using var s2 = Open(); // reloads the DPAPI-protected key
        Assert.Equal("Title aaaaaaaa", s2.GetFindings().Single().Input.Title);
    }

    [Fact]
    public void Saves_session_and_tasks()
    {
        using var s = Open();
        var ctx = new AuditContext("AUD-1", "AUD-1", "Title", "Org", "Lead");
        s.SaveSession("jwt-123", ctx);
        Assert.Equal("jwt-123", s.GetSessionToken());
        Assert.Equal("AUD-1", s.GetAuditContext()!.AuditId);

        s.SaveTasks([new AgentTask("T-1", "Task", "type", "Yuqori", "new", "2026-06-30", 0, 0)]);
        Assert.Equal("Task", s.GetTasks().Single().Title);

        s.ClearSession();
        Assert.Null(s.GetSessionToken());
    }

    public void Dispose()
    {
        try { if (File.Exists(_path)) File.Delete(_path); } catch (IOException) { }
    }
}
