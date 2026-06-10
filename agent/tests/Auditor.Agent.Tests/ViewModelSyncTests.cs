using System.Net;
using Auditor.Agent.Core;
using Auditor.Agent.Core.Api;
using Auditor.Agent.Core.Local;
using Auditor.Agent.Desktop.ViewModels;
using Auditor.Agent.Shared;

namespace Auditor.Agent.Tests;

public class ViewModelSyncTests : IDisposable
{
    private const string ReauthMessage = "Audit tokeni yaroqsiz yoki serverda topilmadi. Tokenni qayta kiriting.";
    private readonly string _path = Path.Combine(Path.GetTempPath(), $"vm-sync-{Guid.NewGuid():N}.db");

    [Fact]
    public async Task Sync_view_auth_failure_prompts_for_new_token_and_preserves_queue()
    {
        using var store = SeedStore();
        using var service = NewService(store);
        var shell = new ShellViewModel(service, initialize: false);
        var vm = new SyncViewModel(shell);

        await vm.SyncNowCommand.ExecuteAsync(null);

        Assert.Equal(ReauthMessage, shell.Toast);
        Assert.IsType<TokenViewModel>(shell.CurrentView);
        Assert.DoesNotContain("0", shell.Toast);
        Assert.Single(store.GetFindings(SyncState.Pending));
    }

    [Fact]
    public async Task Finding_send_auth_failure_does_not_report_zero_sent()
    {
        using var store = SeedStore();
        using var service = NewService(store);
        var shell = new ShellViewModel(service, initialize: false);
        var vm = new FindingViewModel(shell, "T-1", "Task title")
        {
            Title = "New finding",
            Description = "Finding created while token is stale",
        };

        await vm.SendCommand.ExecuteAsync(null);

        Assert.Equal(ReauthMessage, shell.Toast);
        Assert.IsType<TokenViewModel>(shell.CurrentView);
        Assert.DoesNotContain("Finding yuborildi (0)", shell.Toast);
        Assert.Equal(2, store.GetFindings(SyncState.Pending).Count);
    }

    private LocalStore SeedStore()
    {
        var store = new LocalStore(_path);
        store.SaveSession("stale-jwt", new AuditContext("AUD-1", "AUD-1", "Audit", "Org", "Lead"));
        store.EnqueueFinding(new QueuedFinding
        {
            Input = new FindingSyncInput("key-0001", "T-1", "t", "high", 7, "CWE-1", "h", "web", "d"),
        });
        return store;
    }

    private AgentService NewService(LocalStore store)
    {
        var handler = new StubHandler(r =>
        {
            var p = r.RequestUri!.AbsolutePath;
            if (p.EndsWith("/sync/ping")) return (HttpStatusCode.OK, """{"ok":true}""");
            if (p.EndsWith("/sync/start")) return (HttpStatusCode.Unauthorized, """{"ok":false,"error":"token_not_found"}""");
            return (HttpStatusCode.OK, """{"ok":true}""");
        });
        return new AgentService(
            new AgentSettings { DbPath = _path, BaseUrl = "http://test.local" },
            new AgentApiClient(handler.Client()),
            store);
    }

    public void Dispose() { try { if (File.Exists(_path)) File.Delete(_path); } catch (IOException) { } }
}
