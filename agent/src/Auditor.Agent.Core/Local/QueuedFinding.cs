using Auditor.Agent.Shared;

namespace Auditor.Agent.Core.Local;

public enum SyncState { Pending, Syncing, Synced, Failed }

/// <summary>A finding captured offline, awaiting (or past) sync. Wraps the wire DTO.</summary>
public sealed class QueuedFinding
{
    public required FindingSyncInput Input { get; init; }
    public SyncState State { get; set; } = SyncState.Pending;
    public string CreatedAt { get; init; } = DateTime.UtcNow.ToString("u");

    public string IdempotencyKey => Input.IdempotencyKey;
}

/// <summary>One local-log line (TZ §16 "Lokal log").</summary>
public record LogEntry(string Ts, string Level, string Message);

/// <summary>An evidence file captured offline (encrypted at rest; uploaded on sync).</summary>
public sealed class QueuedEvidence
{
    public required string Id { get; init; }
    public string? FindingKey { get; set; }
    public required string Filename { get; init; }
    public string? Mime { get; init; }
    public long SizeBytes { get; init; }
    public string? Sha256 { get; init; }
    public SyncState State { get; set; } = SyncState.Pending;
    public string CreatedAt { get; init; } = DateTime.UtcNow.ToString("u");
}

/// <summary>A queued task-status change (two-way sync).</summary>
public record TaskStatusChange(string TaskId, string ToStatus, SyncState State, string? Comment = null);
