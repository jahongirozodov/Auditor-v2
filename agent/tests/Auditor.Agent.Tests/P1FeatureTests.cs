using System.Net;
using Auditor.Agent.Core;
using Auditor.Agent.Core.Api;
using Auditor.Agent.Core.Crypto;
using Auditor.Agent.Core.Local;
using Xunit;

namespace Auditor.Agent.Tests;

public class AuthVaultTests
{
    [Fact]
    public void RoundTrips_and_rejects_wrong_inputs()
    {
        var blob = AuthVault.Create("B.Mirzayev@gov.uz", "Auditor!2026");
        Assert.True(AuthVault.Verify(blob, "b.mirzayev@gov.uz", "Auditor!2026")); // case-insensitive email
        Assert.False(AuthVault.Verify(blob, "b.mirzayev@gov.uz", "wrong"));
        Assert.False(AuthVault.Verify(blob, "someone@gov.uz", "Auditor!2026"));
        Assert.False(AuthVault.Verify(null, "x", "y"));
        Assert.Equal("b.mirzayev@gov.uz", AuthVault.EmailOf(blob));
    }

    [Fact]
    public void Hash_is_not_the_password()
    {
        var blob = AuthVault.Create("u@gov.uz", "secret-pass");
        Assert.DoesNotContain("secret-pass", blob);
    }
}

public class LocalStoreP1Tests : IDisposable
{
    private readonly string _path = Path.Combine(Path.GetTempPath(), $"p1-{Guid.NewGuid():N}.db");
    private LocalStore Open() => new(_path);

    [Fact]
    public void Log_appends_and_reads_newest_first()
    {
        using var s = Open();
        s.AppendLog("INFO", "first");
        s.AppendLog("WARN", "second");
        var logs = s.GetLogs();
        Assert.Equal("second", logs[0].Message);
        Assert.Equal("WARN", logs[0].Level);
    }

    [Fact]
    public void Evidence_round_trips_encrypted_and_tracks_state()
    {
        using var s = Open();
        var ev = new QueuedEvidence { Id = "e1", Filename = "shot.png", SizeBytes = 4, FindingKey = "fk" };
        var bytes = new byte[] { 1, 2, 3, 4 };
        s.AddEvidence(ev, bytes);

        Assert.Equal(bytes, s.ReadEvidenceBytes("e1"));
        Assert.Single(s.GetEvidence(SyncState.Pending));
        s.SetEvidenceState("e1", SyncState.Synced);
        Assert.Empty(s.GetEvidence(SyncState.Pending));
    }

    [Fact]
    public void Evidence_bytes_not_plaintext_in_file()
    {
        using (var s = Open())
            s.AddEvidence(new QueuedEvidence { Id = "e1", Filename = "x", SizeBytes = 9 },
                System.Text.Encoding.UTF8.GetBytes("TOPSECRET"));
        var raw = File.ReadAllBytes(_path);
        Assert.DoesNotContain("TOPSECRET", System.Text.Encoding.UTF8.GetString(raw));
    }

    [Fact]
    public void Task_status_queue_and_config_persist()
    {
        using var s = Open();
        s.EnqueueTaskStatus("T-1", "done");
        Assert.Single(s.GetTaskStatusQueue(SyncState.Pending));
        s.SetTaskStatusState("T-1", SyncState.Synced);
        Assert.Empty(s.GetTaskStatusQueue(SyncState.Pending));

        s.SetConfig("base_url", "http://x:9");
        Assert.Equal("http://x:9", s.GetConfig("base_url"));
    }

    public void Dispose() { try { if (File.Exists(_path)) File.Delete(_path); } catch (IOException) { } }
}

public class AgentServiceP1Tests : IDisposable
{
    private readonly string _path = Path.Combine(Path.GetTempPath(), $"svc-{Guid.NewGuid():N}.db");

    [Fact]
    public void Offline_login_succeeds_against_cached_credential()
    {
        // Seed a cached credential, then simulate the server being unreachable.
        using (var seed = new LocalStore(_path))
            seed.SaveCredential(AuthVault.Create("a@gov.uz", "pw"));

        var throwing = new StubHandler(_ => throw new HttpRequestException("offline"));
        using var svc = new AgentService(new AgentSettings { DbPath = _path },
            new AgentApiClient(throwing.Client()), new LocalStore(_path));

        var ok = svc.LoginAsync("a@gov.uz", "pw").GetAwaiter().GetResult();
        Assert.True(ok is { Ok: true });
        var bad = svc.LoginAsync("a@gov.uz", "nope").GetAwaiter().GetResult();
        Assert.True(bad is { Ok: false });
    }

    [Fact]
    public void Persisted_config_overrides_settings_on_construct()
    {
        using (var seed = new LocalStore(_path))
            seed.SetConfig("sync_interval", "9");
        var handler = new StubHandler(_ => (HttpStatusCode.OK, """{"ok":true}"""));
        using var svc = new AgentService(new AgentSettings { DbPath = _path, SyncIntervalMinutes = 5 },
            new AgentApiClient(handler.Client()), new LocalStore(_path));
        Assert.Equal(9, svc.SyncIntervalMinutes);
    }

    public void Dispose() { try { if (File.Exists(_path)) File.Delete(_path); } catch (IOException) { } }
}
