using System.Windows.Threading;
using Auditor.Agent.Core;
using Auditor.Agent.Core.Sync;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Auditor.Agent.Desktop.ViewModels;

/// <summary>
/// The single-window shell: owns navigation, the live title/status bars, the token
/// card, nav-badge counts, and the background ping + interval auto-sync timers.
/// </summary>
public partial class ShellViewModel : ObservableObject
{
    public const string SyncReauthMessage = "Audit tokeni yaroqsiz yoki serverda topilmadi. Tokenni qayta kiriting.";

    public AgentService Service { get; }

    [ObservableProperty] private object? currentView;
    [ObservableProperty] private string activeNav = "tasks";
    [ObservableProperty] private bool sidebarVisible;

    // Title + status bar
    [ObservableProperty] private string titleText = "Auditor Agent";
    [ObservableProperty] private bool online;
    [ObservableProperty] private string statusText = "Avtorizatsiyada…";
    [ObservableProperty] private string lastSyncText = "Sync: hali yoʻq";
    [ObservableProperty] private int drafts;
    [ObservableProperty] private int pending;
    [ObservableProperty] private string userIp = "";
    [ObservableProperty] private string version;

    // Token card
    [ObservableProperty] private string tokenMasked = "";
    [ObservableProperty] private string tokenAudit = "";

    // Nav badges
    [ObservableProperty] private int tasksCount;
    [ObservableProperty] private int findingsCount;
    [ObservableProperty] private int syncCount;

    public string UserName { get; set; } = "";

    [ObservableProperty] private string toast = "";
    private readonly DispatcherTimer _toastTimer = new() { Interval = TimeSpan.FromSeconds(3) };

    public void ShowToast(string message)
    {
        Toast = message;
        _toastTimer.Stop();
        _toastTimer.Start();
    }

    private readonly DispatcherTimer _ping = new() { Interval = TimeSpan.FromSeconds(10) };
    private DispatcherTimer? _autoSync;

    public ShellViewModel(AgentService service, bool initialize = true)
    {
        Service = service;
        Version = "v" + service.AgentVersion;
        _ping.Tick += async (_, _) => await PingTickAsync();
        _toastTimer.Tick += (_, _) => { _toastTimer.Stop(); Toast = ""; };
        if (initialize) _ = InitAsync();
    }

    private async Task InitAsync()
    {
        Online = await Service.PingAsync();
        UpdateStatus();
        _ping.Start();
        if (Service.IsAudited)
        {
            UserName = Service.SavedEmail ?? "";
            EnterAudited();
            await ShowTasksAsync();
        }
        else ShowLogin();
    }

    // --- navigation ---
    public void ShowLogin() { SidebarVisible = false; CurrentView = new LoginViewModel(this); }
    public void ShowToken() { SidebarVisible = false; CurrentView = new TokenViewModel(this); }

    public async Task ShowTasksAsync()
    {
        ActiveNav = "tasks";
        var vm = new TasksViewModel(this);
        CurrentView = vm;
        await vm.LoadAsync();
        RefreshCounts();
    }

    [RelayCommand] private async Task NavTasks() => await ShowTasksAsync();
    [RelayCommand] private void NavFindings() { ActiveNav = "findings"; CurrentView = new FindingsListViewModel(this); }
    [RelayCommand] private void NavFiles() { ActiveNav = "files"; CurrentView = new FilesViewModel(this); }
    [RelayCommand] private void NavSync() { ActiveNav = "sync"; CurrentView = new SyncViewModel(this); }
    [RelayCommand] private void NavLog() { ActiveNav = "log"; CurrentView = new LogViewModel(this); }
    [RelayCommand] private void NavSettings() { ActiveNav = "settings"; CurrentView = new SettingsViewModel(this); }

    public void ShowNewFinding(string taskId, string taskTitle) =>
        CurrentView = new FindingViewModel(this, taskId, taskTitle);

    // --- session lifecycle ---
    public void EnterAudited()
    {
        SidebarVisible = true;
        var c = Service.Context;
        TokenAudit = c?.Code ?? c?.AuditId ?? "";
        TitleText = $"Auditor Agent — {Version} · {UserName} · {TokenAudit}";
        UserName = string.IsNullOrEmpty(UserName) ? (Service.SavedEmail ?? "") : UserName;
        UserIp = $"{UserName} · {LocalIp()}";
        StartAutoSync();
        UpdateStatus();
        RefreshCounts();
    }

    public void SetTokenMasked(string token) =>
        TokenMasked = token.Length <= 12 ? token : token[..6] + "…" + token[^4..];

    public async Task DoLogoutAsync()
    {
        await Service.RevokeAndLogoutAsync();
        _autoSync?.Stop();
        SidebarVisible = false;
        TokenMasked = "";
        ShowLogin();
        UpdateStatus();
    }

    // --- live status + counts ---
    public void RefreshCounts()
    {
        var (d, p, _, _) = Service.StatusCounts();
        Drafts = d;
        Pending = p;
        SyncCount = p;
        FindingsCount = Service.AllFindings().Count;
        TasksCount = Service.IsAudited ? (CurrentView as TasksViewModel)?.Tasks.Count ?? TasksCount : 0;
    }

    public void UpdateStatus() =>
        StatusText = !Service.IsAudited ? "Avtorizatsiyada…"
            : Online ? "Onlayn · server bilan aloqada" : "Oflayn · navbatda";

    public void NoteSynced(int created) =>
        LastSyncText = created > 0 ? $"Sync: hozir ({created} yuborildi)" : "Sync: hozir";

    public bool HandleSyncResult(SyncResult result)
    {
        if (!result.RequiresReauth) return false;
        ShowToast(SyncReauthMessage);
        ShowToken();
        UpdateStatus();
        RefreshCounts();
        return true;
    }

    private async Task PingTickAsync()
    {
        var was = Online;
        Online = await Service.PingAsync();
        if (Online != was)
        {
            Service.Log(Online ? "INFO" : "WARN", Online ? "Network reachable" : "Network unreachable — offline mode");
            UpdateStatus();
        }
    }

    private void StartAutoSync()
    {
        _autoSync?.Stop();
        _autoSync = new DispatcherTimer { Interval = TimeSpan.FromMinutes(Math.Max(1, Service.SyncIntervalMinutes)) };
        _autoSync.Tick += async (_, _) => await AutoSyncTickAsync();
        _autoSync.Start();
    }

    private async Task AutoSyncTickAsync()
    {
        if (!Online) return;
        var r = await Service.SyncAsync();
        if (HandleSyncResult(r)) return;
        if (r.Online)
        {
            NoteSynced(r.Created);
            RefreshCounts();
        }
    }

    private static string LocalIp()
    {
        try
        {
            using var s = new System.Net.Sockets.Socket(
                System.Net.Sockets.AddressFamily.InterNetwork,
                System.Net.Sockets.SocketType.Dgram, 0);
            s.Connect("8.8.8.8", 65530);
            return (s.LocalEndPoint as System.Net.IPEndPoint)?.Address.ToString() ?? "127.0.0.1";
        }
        catch { return "127.0.0.1"; }
    }
}
