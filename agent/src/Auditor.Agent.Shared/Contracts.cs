namespace Auditor.Agent.Shared;

// DTOs mirroring the Next.js agent contract (web/src/app/api/v1/agent/**). JSON is
// camelCase on the wire; the ApiClient configures the serializer to match.

// --- auth/login ---
public record AgentLoginRequest(string Email, string Password);
public record AgentUser(string Id, string Name, string Role);
public record AgentLoginResponse(bool Ok, string? Token, AgentUser? User, string? Error);

// --- audit-token/validate ---
public record ValidateTokenRequest(string Token, string? Hostname, string? Os, string? AgentVersion);
public record AuditContext(
    string AuditId,
    string? Code,
    string? Title,
    string? Organization,
    string? GroupLead);
public record ValidateTokenResponse(bool Ok, string? Token, AuditContext? Context, string? Error);

// --- my-tasks ---
public record AgentTask(
    string Id,
    string Title,
    string Type,
    string Priority,
    string Status,
    string Due,
    int Findings,
    int Files);
public record MyTasksResponse(bool Ok, IReadOnlyList<AgentTask>? Tasks, string? Error);

// --- sync ---
public record SyncStartResponse(bool Ok, string? SessionId, string? Error);

public record FindingSyncInput(
    string IdempotencyKey,
    string TaskId,
    string Title,
    string Severity,
    double Cvss,
    string Cwe,
    string Asset,
    string Type,
    string Description);
public record FindingsSyncRequest(IReadOnlyList<FindingSyncInput> Findings);
public record FindingsSyncResponse(
    bool Ok,
    int Created,
    int Skipped,
    IReadOnlyList<string>? FindingIds,
    string? Error);

public record SyncCompleteRequest(string SessionId, int FindingCount, string Status);
public record OkResponse(bool Ok, string? Error);

// --- task status (two-way) ---
public record TaskStatusRequest(string ToStatus);
public record TaskStatusResponse(bool Ok, string? Status, string? Error);

// --- evidence upload (multipart) ---
public record EvidenceUploadResponse(bool Ok, string? Id, string? Error);

// --- token refresh ---
public record AgentRefreshResponse(bool Ok, string? Token, string? Error);

// --- vulnerabilities (server-side findings in the audit) ---
public record Vulnerability(
    string Id, string Title, string Severity, string Status, double Cvss, string Asset, string TaskId, int Evidence);
public record VulnerabilitiesResponse(bool Ok, IReadOnlyList<Vulnerability>? Vulnerabilities, string? Error);

public record EvidenceMeta(
    string Id, string Kind, string Filename, string MimeType, long SizeBytes, string Sha256, string CreatedAt);
public record EvidencesResponse(bool Ok, IReadOnlyList<EvidenceMeta>? Evidences, string? Error);

// --- logs upload ---
public record LogLine(string Ts, string Level, string Message);
public record LogUploadRequest(IReadOnlyList<LogLine> Logs);
public record LogUploadResponse(bool Ok, int Stored, string? Error);

// --- misc ---
public record PingResponse(bool Ok, string? ServerTime, string? MinAgentVersion);
public record VersionResponse(bool Ok, string? Version, string? Notes);
