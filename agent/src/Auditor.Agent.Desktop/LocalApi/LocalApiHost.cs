using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using Auditor.Agent.Core;
using Auditor.Agent.Core.Local;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;

namespace Auditor.Agent.Desktop.LocalApi;

public sealed class LocalApiHost
{
    private readonly AgentService _svc;
    private WebApplication? _app;
    public int Port { get; } = FindFreePort();

    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };
    private static readonly HashSet<string> _allowedTaskStatuses = ["in_progress", "review"];

    public LocalApiHost(AgentService svc) => _svc = svc;

    public async Task StartAsync(CancellationToken ct = default)
    {
        var exeDir = Path.GetDirectoryName(Environment.ProcessPath) ?? AppContext.BaseDirectory;

        // Build a composite file provider: physical wwwroot (dev) → embedded resources (single-file publish)
        var providers = new List<IFileProvider>();
        var physicalWwwroot = Path.Combine(exeDir, "wwwroot");
        if (Directory.Exists(physicalWwwroot))
            providers.Add(new PhysicalFileProvider(physicalWwwroot));
        providers.Add(new EmbeddedFileProvider(Assembly.GetExecutingAssembly(), "Auditor.Agent.Desktop.wwwroot"));
        IFileProvider fileProvider = providers.Count == 1
            ? providers[0]
            : new CompositeFileProvider(providers);

        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            Args = new[] { $"--urls=http://127.0.0.1:{Port}" },
            ContentRootPath = exeDir,
            ApplicationName = "AuditorAgent",
        });

        builder.Logging.ClearProviders();

        var app = builder.Build();
        _app = app;

        var contentTypeProvider = new FileExtensionContentTypeProvider();
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = fileProvider,
            ContentTypeProvider = contentTypeProvider,
        });

        MapRoutes(app);

        // SPA fallback: serve index.html for any unmatched route
        app.MapFallback(async ctx =>
        {
            var fileInfo = fileProvider.GetFileInfo("index.html");
            if (!fileInfo.Exists) { ctx.Response.StatusCode = 404; return; }
            ctx.Response.ContentType = "text/html; charset=utf-8";
            await using var stream = fileInfo.CreateReadStream();
            await stream.CopyToAsync(ctx.Response.Body);
        });

        await app.StartAsync(ct);
    }

    public async Task StopAsync()
    {
        if (_app is not null) await _app.StopAsync();
    }

    private void MapRoutes(WebApplication app)
    {
        // ── state ─────────────────────────────────────────────────────────
        app.MapGet("/api/state", () =>
        {
            var (d, p, s, f) = _svc.StatusCounts();
            var c = _svc.Context;
            return Results.Json(new
            {
                loggedIn = _svc.HasLocalCredential || _svc.IsAudited,
                audited = _svc.IsAudited,
                email = _svc.SavedEmail ?? "",
                tokenMasked = c is null ? "" : Mask(c.AuditId ?? ""),
                auditCode = c?.Code ?? c?.AuditId ?? "",
                version = _svc.AgentVersion,
                serverUrl = _svc.ServerUrl,
                syncInterval = _svc.SyncIntervalMinutes,
                drafts = d,
                pending = p,
                synced = s,
                failed = f,
            }, Json);
        });

        // ── auth ──────────────────────────────────────────────────────────
        app.MapPost("/api/login", async (HttpContext ctx) =>
        {
            var b = await ctx.Request.ReadFromJsonAsync<LoginBody>(Json);
            if (b is null) return Results.BadRequest();
            var res = await _svc.LoginAsync(b.Email.Trim(), b.Password);
            return Results.Json(new
            {
                ok = res?.Ok ?? false,
                audited = _svc.IsAudited,
                savedEmail = _svc.SavedEmail,
                error = res?.Error,
            }, Json);
        });

        app.MapPost("/api/logout", async () =>
        {
            await _svc.RevokeAndLogoutAsync();
            return Results.Json(new { ok = true }, Json);
        });

        // ── audit token ───────────────────────────────────────────────────
        app.MapPost("/api/token/validate", async (HttpContext ctx) =>
        {
            var b = await ctx.Request.ReadFromJsonAsync<TokenBody>(Json);
            if (b is null) return Results.BadRequest();
            var res = await _svc.ValidateTokenAsync(b.Token.Trim());
            var c = _svc.Context;
            return Results.Json(new
            {
                ok = res?.Ok ?? false,
                tokenMasked = c is null ? "" : Mask(c.AuditId ?? ""),
                auditCode = c?.Code ?? c?.AuditId ?? "",
                error = res?.Error,
            }, Json);
        });

        // ── tasks ─────────────────────────────────────────────────────────
        app.MapGet("/api/tasks", async () =>
        {
            var list = await _svc.LoadTasksAsync();
            return Results.Json(list.Select(t => new
            {
                t.Id, t.Title, t.Type, t.Priority, t.Status, t.Due, t.Findings, t.Files,
            }), Json);
        });

        app.MapPost("/api/tasks/{id}/status", async (string id, HttpContext ctx) =>
        {
            var b = await ctx.Request.ReadFromJsonAsync<TaskStatusBody>(Json);
            if (b is null || string.IsNullOrWhiteSpace(b.ToStatus)) return Results.BadRequest();
            if (!_allowedTaskStatuses.Contains(b.ToStatus)) return Results.BadRequest();
            var online = await _svc.PingAsync();
            if (!online) return Results.Json(new { ok = false, error = "offline" }, Json);
            _svc.ToggleTaskStatus(id, b.ToStatus);
            await _svc.SyncAsync();
            return Results.Json(new { ok = true }, Json);
        });

        // ── findings ──────────────────────────────────────────────────────
        app.MapPost("/api/findings", async (HttpContext ctx) =>
        {
            var b = await ctx.Request.ReadFromJsonAsync<FindingBody>(Json);
            if (b is null) return Results.BadRequest();
            var f = _svc.CaptureFinding(b.TaskId, b.Title, b.Severity, b.Cvss,
                string.IsNullOrWhiteSpace(b.Cwe) ? "CWE-284" : b.Cwe,
                b.Asset, "manual", b.Description);
            return Results.Json(new { ok = true, key = f.IdempotencyKey }, Json);
        });

        app.MapGet("/api/findings", () =>
        {
            var byKey = _svc.AllEvidence()
                .Where(e => e.FindingKey is not null)
                .GroupBy(e => e.FindingKey!)
                .ToDictionary(g => g.Key, g => g.Count());

            var list = _svc.AllFindings().Select(f =>
            {
                var st = FindingStatus.Of(f.State);
                byKey.TryGetValue(f.IdempotencyKey, out var ec);
                return new
                {
                    f.IdempotencyKey,
                    title = f.Input.Title,
                    severity = f.Input.Severity,
                    cvss = f.Input.Cvss,
                    cwe = f.Input.Cwe,
                    asset = f.Input.Asset,
                    taskId = f.Input.TaskId,
                    evidenceCount = ec,
                    state = st.Key,
                    stateKind = st.Kind,
                    stateLabel = st.Label,
                };
            });

            return Results.Json(list, Json);
        });

        // ── evidence ──────────────────────────────────────────────────────
        app.MapGet("/api/evidence", () =>
        {
            var list = _svc.AllEvidence().Select(e => new
            {
                e.Id, e.Filename, e.Mime, e.SizeBytes, e.FindingKey,
                state = e.State.ToString().ToLowerInvariant(),
            });
            return Results.Json(list, Json);
        });

        app.MapPost("/api/evidence", async (HttpContext ctx) =>
        {
            if (!ctx.Request.HasFormContentType) return Results.BadRequest();
            var form = await ctx.Request.ReadFormAsync();
            var file = form.Files.GetFile("file");
            var findingKey = form["findingKey"].ToString();
            if (file is null) return Results.BadRequest();

            var tmp = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString("N") + "_" + file.FileName);
            try
            {
                await using (var fs = File.Create(tmp))
                    await file.CopyToAsync(fs);
                _svc.CaptureEvidence(string.IsNullOrEmpty(findingKey) ? null : findingKey, tmp);
                return Results.Json(new { ok = true, name = file.FileName }, Json);
            }
            catch (Exception ex)
            {
                return Results.Json(new { ok = false, error = ex.Message }, Json);
            }
            finally
            {
                try { File.Delete(tmp); } catch { }
            }
        });

        // ── sync ──────────────────────────────────────────────────────────
        app.MapPost("/api/sync", async () =>
        {
            var r = await _svc.SyncAsync();
            return Results.Json(new
            {
                ok = true,
                r.Online, r.Created, r.EvidenceSent, r.TasksSent,
                r.RequiresReauth, r.Error,
            }, Json);
        });

        // ── logs ──────────────────────────────────────────────────────────
        app.MapGet("/api/logs", () =>
        {
            var list = _svc.Logs(200).Select(l => new { l.Ts, l.Level, l.Message });
            return Results.Json(list, Json);
        });

        // ── settings ──────────────────────────────────────────────────────
        app.MapGet("/api/settings", () =>
            Results.Json(new
            {
                serverUrl = _svc.ServerUrl,
                syncInterval = _svc.SyncIntervalMinutes,
                encryption = AgentService.EncryptionLabel,
                version = _svc.AgentVersion,
            }, Json));

        app.MapPut("/api/settings", async (HttpContext ctx) =>
        {
            var b = await ctx.Request.ReadFromJsonAsync<SettingsBody>(Json);
            if (b is null) return Results.BadRequest();
            if (!string.IsNullOrWhiteSpace(b.ServerUrl)) _svc.SetServerUrl(b.ServerUrl);
            if (b.SyncInterval > 0) _svc.SetSyncInterval(b.SyncInterval);
            return Results.Json(new { ok = true }, Json);
        });

        // ── misc ──────────────────────────────────────────────────────────
        app.MapPost("/api/open-browser", () =>
        {
            try
            {
                Process.Start(new ProcessStartInfo($"http://127.0.0.1:{Port}/")
                {
                    UseShellExecute = true,
                });
                return Results.Json(new { ok = true }, Json);
            }
            catch
            {
                return Results.Json(new { ok = false }, Json);
            }
        });

        app.MapPost("/api/update-check", async () =>
        {
            var (available, latest) = await _svc.CheckUpdateAsync();
            return Results.Json(new { available, latest }, Json);
        });

        app.MapGet("/api/ping", async () =>
        {
            var ok = await _svc.PingAsync();
            return Results.Json(new { ok }, Json);
        });
    }

    private static int FindFreePort()
    {
        using var l = new TcpListener(IPAddress.Loopback, 0);
        l.Start();
        var port = ((IPEndPoint)l.LocalEndpoint).Port;
        l.Stop();
        return port;
    }

    private static string Mask(string t) =>
        t.Length <= 12 ? t : t[..6] + "…" + t[^4..];

    private record LoginBody(string Email, string Password);
    private record TokenBody(string Token);
    private record FindingBody(string TaskId, string Title, string Severity, double Cvss,
        string Cwe, string Asset, string Description);
    private record SettingsBody(string? ServerUrl, int SyncInterval);
    private record TaskStatusBody(string ToStatus);
}
