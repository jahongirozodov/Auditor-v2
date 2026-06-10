using Auditor.Agent.Core.Api;
using Auditor.Agent.Core.Local;
using Auditor.Agent.Shared;

namespace Auditor.Agent.Core.Sync;

public record SyncResult(
    bool Online,
    int Created,
    int Skipped,
    int EvidenceSent,
    int TasksSent,
    int StillPending,
    string? Error,
    bool RequiresReauth = false)
{
    public static SyncResult Offline() => new(false, 0, 0, 0, 0, 0, "offline");
}

/// <summary>Live progress for one queue item (Key = idempotencyKey / evidenceId / taskId).</summary>
public record SyncProgress(string Key, int Percent, string State);

/// <summary>
/// One sync pass: ping → start → push pending findings, evidence, and task-status
/// changes → complete. Idempotent — findings carry an idempotency key, evidence/status
/// are marked synced only on a server OK, so re-runs never duplicate (TZ §9.5).
/// </summary>
public sealed class SyncEngine
{
    private readonly AgentApiClient _api;
    private readonly LocalStore _store;

    public SyncEngine(AgentApiClient api, LocalStore store)
    {
        _api = api;
        _store = store;
    }

    public async Task<SyncResult> SyncAsync(
        IProgress<SyncProgress>? progress = null, CancellationToken ct = default)
    {
        var ping = await SafeAsync(() => _api.PingAsync(ct));
        if (ping is null or { Ok: false }) return SyncResult.Offline();

        var findings = _store.GetFindings(SyncState.Pending);
        var evidence = _store.GetEvidence(SyncState.Pending);
        var tasks = _store.GetTaskStatusQueue(SyncState.Pending);
        if (findings.Count == 0 && evidence.Count == 0 && tasks.Count == 0)
            return new SyncResult(true, 0, 0, 0, 0, 0, null);

        var start = await SafeAsync(() => _api.SyncStartAsync(ct));
        if (start is null or { Ok: false } || start.SessionId is null)
        {
            var startError = start?.Error ?? "sync_start_failed";
            var requiresReauth = IsAuthError(startError);
            return new SyncResult(true, 0, 0, 0, 0, findings.Count + evidence.Count + tasks.Count, startError, requiresReauth);
        }

        // 1) Findings (must precede evidence — evidence links to a synced finding).
        int created = 0, skipped = 0;
        string? error = null;
        if (findings.Count > 0)
        {
            foreach (var f in findings) _store.SetFindingState(f.IdempotencyKey, SyncState.Syncing);
            var req = new FindingsSyncRequest(findings.Select(p => p.Input).ToList());
            var res = await SafeAsync(() => _api.SyncFindingsAsync(req, ct));
            if (res is null or { Ok: false })
            {
                foreach (var f in findings) _store.SetFindingState(f.IdempotencyKey, SyncState.Failed);
                error = res?.Error ?? "findings_sync_failed";
            }
            else
            {
                foreach (var f in findings)
                {
                    _store.SetFindingState(f.IdempotencyKey, SyncState.Synced);
                    progress?.Report(new SyncProgress(f.IdempotencyKey, 100, "synced"));
                }
                created = res.Created;
                skipped = res.Skipped;
            }
        }

        // 2) Evidence (per file, with live byte progress).
        int evidenceSent = 0;
        foreach (var e in evidence)
        {
            progress?.Report(new SyncProgress(e.Id, 0, "uploading"));
            var bytes = _store.ReadEvidenceBytes(e.Id);
            var fileProgress = progress is null
                ? null
                : new DelegateProgress<int>(p => progress.Report(new SyncProgress(e.Id, p, "uploading")));
            var res = await SafeAsync(() => _api.UploadEvidenceAsync(
                bytes, e.Filename, e.Mime ?? "application/octet-stream", e.FindingKey ?? "", fileProgress, ct));
            if (res is { Ok: true })
            {
                _store.SetEvidenceState(e.Id, SyncState.Synced);
                progress?.Report(new SyncProgress(e.Id, 100, "synced"));
                evidenceSent++;
            }
            else
            {
                _store.SetEvidenceState(e.Id, SyncState.Failed);
                progress?.Report(new SyncProgress(e.Id, 0, "failed"));
            }
        }

        // 3) Task-status changes.
        int tasksSent = 0;
        foreach (var ts in tasks)
        {
            progress?.Report(new SyncProgress(ts.TaskId, 50, "uploading"));
            var res = await SafeAsync(() => _api.UpdateTaskStatusAsync(ts.TaskId, ts.ToStatus, ct));
            if (res is { Ok: true })
            {
                _store.SetTaskStatusState(ts.TaskId, SyncState.Synced);
                progress?.Report(new SyncProgress(ts.TaskId, 100, "synced"));
                tasksSent++;
            }
            else
            {
                _store.SetTaskStatusState(ts.TaskId, SyncState.Failed);
                progress?.Report(new SyncProgress(ts.TaskId, 0, "failed"));
            }
        }

        await SafeAsync(() => _api.SyncCompleteAsync(
            new SyncCompleteRequest(start.SessionId, created, error is null ? "completed" : "failed"), ct));

        var (stillPending, _, _) = _store.Counts();
        var pendingTotal = stillPending
            + _store.GetEvidence(SyncState.Pending).Count
            + _store.GetTaskStatusQueue(SyncState.Pending).Count;
        return new SyncResult(true, created, skipped, evidenceSent, tasksSent, pendingTotal, error);
    }

    private static async Task<T?> SafeAsync<T>(Func<Task<T?>> call) where T : class
    {
        try { return await call(); }
        catch (HttpRequestException) { return null; }
        catch (TaskCanceledException) { return null; }
    }

    private static bool IsAuthError(string? error) => error is
        "invalid_token" or
        "token_not_found" or
        "token_inactive" or
        "token_mismatch" or
        "audit_scope_required";
}
