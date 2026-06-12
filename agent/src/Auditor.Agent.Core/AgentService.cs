using System.IO;
using System.Security.Cryptography;
using Auditor.Agent.Core.Api;
using Auditor.Agent.Core.Crypto;
using Auditor.Agent.Core.Local;
using Auditor.Agent.Core.Sync;
using Auditor.Agent.Shared;

namespace Auditor.Agent.Core;

/// <summary>
/// Facade the UI drives: (offline) login → validate token → load tasks → capture
/// findings/evidence offline → toggle task status → auto-sync. Owns the ApiClient,
/// encrypted LocalStore, and SyncEngine, and writes the local activity log.
/// </summary>
public sealed class AgentService : IDisposable
{
    private readonly AgentSettings _settings;
    private AgentApiClient _api;
    private readonly LocalStore _store;
    private SyncEngine _sync;

    public AuditContext? Context { get; private set; }
    public bool IsAudited => Context is not null;

    public string ServerUrl => _settings.BaseUrl;
    public int SyncIntervalMinutes => _settings.SyncIntervalMinutes;
    public string AgentVersion => _settings.AgentVersion;
    public const string EncryptionLabel = "AES-256-GCM (yoqilgan)";

    public AgentService(AgentSettings settings, AgentApiClient? api = null, LocalStore? store = null)
    {
        _settings = settings;
        _store = store ?? new LocalStore(settings.DbPath);

        // Persisted Settings-screen overrides win over appsettings.json defaults.
        var url = _store.GetConfig("base_url");
        if (!string.IsNullOrWhiteSpace(url)) _settings.BaseUrl = url;
        var iv = _store.GetConfig("sync_interval");
        if (int.TryParse(iv, out var m) && m > 0) _settings.SyncIntervalMinutes = m;

        _api = api ?? AgentApiClient.Create(_settings.BaseUrl);
        _sync = new SyncEngine(_api, _store);

        _store.AppendLog("INFO", $"Application started — v{_settings.AgentVersion}");

        // Resume a prior offline session (encrypted).
        var saved = _store.GetSessionToken();
        if (saved is not null)
        {
            _api.SetToken(saved);
            Context = _store.GetAuditContext();
            _store.AppendLog("INFO", "Session resumed from local store");
        }
    }

    public void Log(string level, string message) => _store.AppendLog(level, message);
    public List<LogEntry> Logs(int limit = 200) => _store.GetLogs(limit);

    public async Task<bool> PingAsync(CancellationToken ct = default)
    {
        try { return await _api.PingAsync(ct) is { Ok: true }; }
        catch { return false; }
    }

    // --- auth (online → cache credential; offline → validate against cache) ---
    public string? SavedEmail => AuthVault.EmailOf(_store.GetCredential());
    public bool HasLocalCredential => _store.GetCredential() is not null;

    public async Task<AgentLoginResponse?> LoginAsync(string email, string password, CancellationToken ct = default)
    {
        AgentLoginResponse? res = null;
        try { res = await _api.LoginAsync(new AgentLoginRequest(email, password), ct); }
        catch { /* offline → fall through */ }

        if (res is { Ok: true, Token: not null })
        {
            _api.SetToken(res.Token);
            _store.SaveCredential(AuthVault.Create(email, password)); // enable offline next time
            _store.AppendLog("INFO", "User authenticated (online)");
            return res;
        }
        if (res is { Ok: false }) return res; // server reachable but rejected

        // Server unreachable → try the offline local account.
        if (AuthVault.Verify(_store.GetCredential(), email, password))
        {
            _store.AppendLog("INFO", "User authenticated locally (offline)");
            return new AgentLoginResponse(true, null, null, null);
        }
        return new AgentLoginResponse(false, null, null, "offline_no_credential");
    }

    public async Task<ValidateTokenResponse?> ValidateTokenAsync(string token, CancellationToken ct = default)
    {
        var req = new ValidateTokenRequest(token, Environment.MachineName,
            Environment.OSVersion.VersionString, _settings.AgentVersion);
        var res = await _api.ValidateTokenAsync(req, ct);
        if (res is { Ok: true, Token: not null, Context: not null })
        {
            _api.SetToken(res.Token);
            Context = res.Context;
            _store.SaveSession(res.Token, res.Context);
            _store.AppendLog("INFO", $"Audit token validated ({Trunc(token)})");
        }
        return res;
    }

    public async Task<List<AgentTask>> LoadTasksAsync(CancellationToken ct = default)
    {
        if (Context is null) return [];
        try
        {
            var res = await _api.GetMyTasksAsync(Context.AuditId, ct);
            if (res is { Ok: true, Tasks: not null })
            {
                _store.SaveTasks(res.Tasks);
                return res.Tasks.ToList();
            }
        }
        catch { _store.AppendLog("WARN", "Tasks fetch failed — using local cache"); }
        return _store.GetTasks();
    }

    // --- findings ---
    public QueuedFinding CaptureFinding(string taskId, string title, string severity, double cvss,
        string cwe, string asset, string type, string description)
    {
        var input = new FindingSyncInput(
            IdempotencyKey: Guid.NewGuid().ToString("N"),
            TaskId: taskId, Title: title, Severity: severity, Cvss: cvss,
            Cwe: string.IsNullOrWhiteSpace(cwe) ? "CWE-284" : cwe,
            Asset: asset, Type: string.IsNullOrWhiteSpace(type) ? "manual" : type,
            Description: description);
        var f = new QueuedFinding { Input = input };
        _store.EnqueueFinding(f);
        _store.AppendLog("INFO", $"Finding created ({Trunc(input.IdempotencyKey)}) — {title}");
        return f;
    }

    public List<QueuedFinding> AllFindings() => _store.GetFindings();

    // --- evidence (local encrypted; uploaded in P2) ---
    public QueuedEvidence CaptureEvidence(string? findingKey, string filePath)
    {
        var bytes = File.ReadAllBytes(filePath);
        var name = Path.GetFileName(filePath);
        var ev = new QueuedEvidence
        {
            Id = Guid.NewGuid().ToString("N"),
            FindingKey = findingKey,
            Filename = name,
            Mime = MimeOf(name),
            SizeBytes = bytes.LongLength,
            Sha256 = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(),
        };
        _store.AddEvidence(ev, bytes);
        _store.AppendLog("INFO", $"Evidence attached: {name}");
        return ev;
    }

    public List<QueuedEvidence> AllEvidence() => _store.GetEvidence();

    // --- task status (two-way; pushed in P2) ---
    public void ToggleTaskStatus(string taskId, string toStatus, string? comment = null)
    {
        _store.EnqueueTaskStatus(taskId, toStatus, comment);
        _store.AppendLog("INFO", $"Task {taskId} status changed → {toStatus}");
    }

    public List<TaskStatusChange> PendingTaskStatus() => _store.GetTaskStatusQueue(SyncState.Pending);

    // --- sync ---
    public async Task<SyncResult> SyncAsync(
        IProgress<SyncProgress>? progress = null, CancellationToken ct = default)
    {
        _store.AppendLog("INFO", "Sync session started");
        await RefreshSessionAsync(ct); // extend the JWT while we're online
        var r = await _sync.SyncAsync(progress, ct);
        _store.AppendLog(r.Online ? "INFO" : "WARN",
            r.Online ? $"Sync session completed ({r.Created} sent, {r.Skipped} skipped)" : "Sync skipped — offline");
        if (r.RequiresReauth)
        {
            _store.ClearSession();
            _api.SetToken(null);
            Context = null;
            _store.AppendLog("WARN", $"Audit token revalidation required ({r.Error})");
        }
        if (r.Online && !r.RequiresReauth) await UploadNewLogsAsync(ct);
        return r;
    }

    /// <summary>Refresh the agent JWT (best-effort, online) so the session outlives its TTL.</summary>
    private async Task RefreshSessionAsync(CancellationToken ct)
    {
        if (Context is null) return;
        try
        {
            var res = await _api.RefreshTokenAsync(ct);
            if (res is { Ok: true, Token: not null })
            {
                _api.SetToken(res.Token);
                _store.SaveSession(res.Token, Context);
            }
        }
        catch { /* offline — keep the current token */ }
    }

    /// <summary>Upload local-log lines newer than the high-water mark (best-effort).</summary>
    private async Task UploadNewLogsAsync(CancellationToken ct)
    {
        try
        {
            var marker = long.TryParse(_store.GetConfig("last_log_id"), out var m) ? m : 0;
            var lines = _store.GetLogsAfter(marker);
            if (lines.Count == 0) return;
            var req = new LogUploadRequest(lines.Select(l => new LogLine(l.Ts, l.Level, l.Message)).ToList());
            var res = await _api.UploadLogsAsync(req, ct);
            if (res is { Ok: true })
                _store.SetConfig("last_log_id", lines.Max(l => l.Id).ToString());
        }
        catch { /* best-effort */ }
    }

    /// <summary>Server-side findings in this audit (available for a future "synced findings" view).</summary>
    public async Task<List<Vulnerability>> FetchVulnerabilitiesAsync(CancellationToken ct = default)
    {
        if (Context is null) return [];
        try
        {
            var res = await _api.GetVulnerabilitiesAsync(ct);
            return res is { Ok: true, Vulnerabilities: not null } ? res.Vulnerabilities.ToList() : [];
        }
        catch { return []; }
    }

    /// <summary>Status-bar counters: drafts (pending findings) + total unsent across all queues.</summary>
    public (int drafts, int pending, int synced, int failed) StatusCounts()
    {
        var (p, s, f) = _store.Counts();
        var ev = _store.GetEvidence(SyncState.Pending).Count;
        var ts = _store.GetTaskStatusQueue(SyncState.Pending).Count;
        return (p, p + ev + ts, s, f);
    }

    // --- config (Settings screen) ---
    public void SetServerUrl(string url)
    {
        _settings.BaseUrl = url.TrimEnd('/').Trim();
        _store.SetConfig("base_url", _settings.BaseUrl);
        // Reconnect immediately — recreate client and sync engine with new base URL.
        _api = AgentApiClient.Create(_settings.BaseUrl);
        _sync = new SyncEngine(_api, _store);
        var saved = _store.GetSessionToken();
        if (saved is not null) _api.SetToken(saved);
        _store.AppendLog("INFO", $"Server address changed to {_settings.BaseUrl}");
    }

    public void SetSyncInterval(int minutes)
    {
        _settings.SyncIntervalMinutes = Math.Max(1, minutes);
        _store.SetConfig("sync_interval", _settings.SyncIntervalMinutes.ToString());
    }

    /// <summary>Update check (no self-replace): true when the server advertises a newer build.</summary>
    public async Task<(bool available, string? latest)> CheckUpdateAsync(CancellationToken ct = default)
    {
        try
        {
            var v = await _api.GetVersionAsync(ct);
            var latest = v?.Version;
            var available = latest is not null &&
                string.CompareOrdinal(latest, _settings.AgentVersion) > 0;
            return (available, latest);
        }
        catch { return (false, null); }
    }

    /// <summary>Revoke the token server-side (best-effort, online) then clear locally.</summary>
    public async Task RevokeAndLogoutAsync(CancellationToken ct = default)
    {
        if (IsAudited)
        {
            try { await _api.RevokeTokenAsync(ct); _store.AppendLog("INFO", "Audit token revoked on server"); }
            catch { _store.AppendLog("WARN", "Token revoke skipped — offline"); }
        }
        Logout();
    }

    public void Logout()
    {
        _store.ClearSession();
        _api.SetToken(null);
        Context = null;
        _store.AppendLog("INFO", "Logged out — session cleared");
    }

    public void Dispose() => _store.Dispose();

    private static string Trunc(string s) => s.Length <= 12 ? s : s[..6] + "…" + s[^4..];

    private static string MimeOf(string name) => Path.GetExtension(name).ToLowerInvariant() switch
    {
        ".png" or ".jpg" or ".jpeg" or ".gif" => "image/" + Path.GetExtension(name).Trim('.'),
        ".pcap" or ".pcapng" => "application/vnd.tcpdump.pcap",
        ".csv" => "text/csv",
        ".txt" or ".log" or ".cfg" or ".conf" => "text/plain",
        _ => "application/octet-stream",
    };
}
