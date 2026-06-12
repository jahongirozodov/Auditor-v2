using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Auditor.Agent.Shared;

namespace Auditor.Agent.Core.Api;

/// <summary>
/// Typed client for the Next.js agent API (web/src/app/api/v1/agent/**). Holds the
/// current bearer token in memory; callers set it from the login / validate response.
/// Base address is configurable (improves on the TZ hard-coded-URL known-limit).
/// </summary>
public sealed class AgentApiClient
{
    public static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    private readonly HttpClient _http;
    private string? _token;

    public AgentApiClient(HttpClient http) => _http = http;

    public static AgentApiClient Create(string baseUrl) =>
        new(new HttpClient { BaseAddress = new Uri(baseUrl) });

    public void SetToken(string? token) => _token = token;

    public async Task<PingResponse?> PingAsync(CancellationToken ct = default) =>
        await GetAsync<PingResponse>("/api/v1/agent/sync/ping", auth: false, ct);

    public async Task<VersionResponse?> GetVersionAsync(CancellationToken ct = default) =>
        await GetAsync<VersionResponse>("/api/v1/agent/version", auth: false, ct);

    public Task<AgentLoginResponse?> LoginAsync(AgentLoginRequest req, CancellationToken ct = default) =>
        PostAsync<AgentLoginRequest, AgentLoginResponse>("/api/v1/agent/auth/login", req, auth: false, ct);

    public Task<ValidateTokenResponse?> ValidateTokenAsync(ValidateTokenRequest req, CancellationToken ct = default) =>
        PostAsync<ValidateTokenRequest, ValidateTokenResponse>("/api/v1/agent/audit-token/validate", req, auth: false, ct);

    public Task<MyTasksResponse?> GetMyTasksAsync(string auditId, CancellationToken ct = default) =>
        GetAsync<MyTasksResponse>($"/api/v1/agent/audits/{Uri.EscapeDataString(auditId)}/my-tasks", auth: true, ct);

    public Task<SyncStartResponse?> SyncStartAsync(CancellationToken ct = default) =>
        PostAsync<object, SyncStartResponse>("/api/v1/agent/sync/start", new { }, auth: true, ct);

    public Task<FindingsSyncResponse?> SyncFindingsAsync(FindingsSyncRequest req, CancellationToken ct = default) =>
        PostAsync<FindingsSyncRequest, FindingsSyncResponse>("/api/v1/agent/findings/sync", req, auth: true, ct);

    public Task<OkResponse?> SyncCompleteAsync(SyncCompleteRequest req, CancellationToken ct = default) =>
        PostAsync<SyncCompleteRequest, OkResponse>("/api/v1/agent/sync/complete", req, auth: true, ct);

    public Task<TaskStatusResponse?> UpdateTaskStatusAsync(string taskId, string toStatus, string? comment = null, CancellationToken ct = default) =>
        PostAsync<TaskStatusRequest, TaskStatusResponse>(
            $"/api/v1/agent/tasks/{Uri.EscapeDataString(taskId)}/status", new TaskStatusRequest(toStatus, comment), auth: true, ct);

    public Task<OkResponse?> RevokeTokenAsync(CancellationToken ct = default) =>
        PostAsync<object, OkResponse>("/api/v1/agent/token/revoke", new { }, auth: true, ct);

    public Task<AgentRefreshResponse?> RefreshTokenAsync(CancellationToken ct = default) =>
        PostAsync<object, AgentRefreshResponse>("/api/v1/agent/token/refresh", new { }, auth: true, ct);

    public Task<VulnerabilitiesResponse?> GetVulnerabilitiesAsync(CancellationToken ct = default) =>
        GetAsync<VulnerabilitiesResponse>("/api/v1/agent/vulnerabilities", auth: true, ct);

    public Task<EvidencesResponse?> GetVulnerabilityEvidencesAsync(string findingId, CancellationToken ct = default) =>
        GetAsync<EvidencesResponse>(
            $"/api/v1/agent/vulnerabilities/{Uri.EscapeDataString(findingId)}/evidences", auth: true, ct);

    public Task<LogUploadResponse?> UploadLogsAsync(LogUploadRequest req, CancellationToken ct = default) =>
        PostAsync<LogUploadRequest, LogUploadResponse>("/api/v1/agent/logs/upload", req, auth: true, ct);

    public async Task<EvidenceUploadResponse?> UploadEvidenceAsync(
        byte[] bytes, string filename, string mime, string findingKey,
        IProgress<int>? progress = null, CancellationToken ct = default)
    {
        using var content = new MultipartFormDataContent();
        var file = new ProgressableByteArrayContent(
            bytes, string.IsNullOrWhiteSpace(mime) ? "application/octet-stream" : mime, progress);
        content.Add(file, "file", filename);
        content.Add(new StringContent(findingKey), "findingKey");

        using var msg = new HttpRequestMessage(HttpMethod.Post, "/api/v1/agent/evidences/upload") { Content = content };
        AddAuth(msg);
        using var res = await _http.SendAsync(msg, ct);
        return await ReadAsync<EvidenceUploadResponse>(res, ct);
    }

    // --- transport ---
    private async Task<TRes?> GetAsync<TRes>(string path, bool auth, CancellationToken ct)
    {
        using var msg = new HttpRequestMessage(HttpMethod.Get, path);
        if (auth) AddAuth(msg);
        using var res = await _http.SendAsync(msg, ct);
        return await ReadAsync<TRes>(res, ct);
    }

    private async Task<TRes?> PostAsync<TReq, TRes>(string path, TReq body, bool auth, CancellationToken ct)
    {
        using var msg = new HttpRequestMessage(HttpMethod.Post, path)
        {
            Content = JsonContent.Create(body, options: JsonOptions),
        };
        if (auth) AddAuth(msg);
        using var res = await _http.SendAsync(msg, ct);
        return await ReadAsync<TRes>(res, ct);
    }

    private void AddAuth(HttpRequestMessage msg)
    {
        if (!string.IsNullOrEmpty(_token))
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _token);
    }

    // The API returns its own {ok:false,...} bodies with non-2xx codes; deserialize
    // the body regardless so the caller sees the structured error.
    private static async Task<TRes?> ReadAsync<TRes>(HttpResponseMessage res, CancellationToken ct)
    {
        var stream = await res.Content.ReadAsStreamAsync(ct);
        return await JsonSerializer.DeserializeAsync<TRes>(stream, JsonOptions, ct);
    }
}
