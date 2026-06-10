using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Auditor.Agent.Core.Local;
using Auditor.Agent.Shared;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Win32;

namespace Auditor.Agent.Desktop.ViewModels;

// ---------- Login ----------
public partial class LoginViewModel : ObservableObject
{
    private readonly ShellViewModel _shell;
    [ObservableProperty] private string login = "";
    [ObservableProperty] private string password = "";
    [ObservableProperty] private string error = "";
    [ObservableProperty] private bool busy;

    public LoginViewModel(ShellViewModel shell)
    {
        _shell = shell;
        Login = shell.Service.SavedEmail ?? "";
    }

    [RelayCommand]
    private async Task SignInAsync()
    {
        Error = "";
        if (string.IsNullOrWhiteSpace(Login) || string.IsNullOrEmpty(Password))
        {
            Error = "Login va parolni kiriting";
            return;
        }
        Busy = true;
        var res = await _shell.Service.LoginAsync(Login.Trim(), Password);
        Busy = false;
        if (res is { Ok: true })
        {
            _shell.UserName = res.User?.Name ?? Login.Trim();
            // Offline resume already has a session → go straight in.
            if (_shell.Service.IsAudited) { _shell.EnterAudited(); await _shell.ShowTasksAsync(); }
            else _shell.ShowToken();
        }
        else Error = res?.Error switch
        {
            "invalid_credentials" => "Login yoki parol notoʻgʻri",
            "locked" => "Hisob vaqtincha bloklangan",
            "offline_no_credential" => "Oflayn — avval onlayn kirish kerak",
            _ => "Kirishda xatolik",
        };
    }
}

// ---------- Token ----------
public partial class TokenViewModel : ObservableObject
{
    private readonly ShellViewModel _shell;
    [ObservableProperty] private string tokenText = "";
    [ObservableProperty] private string error = "";
    [ObservableProperty] private bool busy;

    public TokenViewModel(ShellViewModel shell) => _shell = shell;

    [RelayCommand]
    private async Task ConfirmAsync()
    {
        Error = "";
        if (string.IsNullOrWhiteSpace(TokenText)) { Error = "Audit tokenini kiriting"; return; }
        Busy = true;
        var res = await _shell.Service.ValidateTokenAsync(TokenText.Trim());
        Busy = false;
        if (res is { Ok: true })
        {
            _shell.SetTokenMasked(TokenText.Trim());
            _shell.EnterAudited();
            await _shell.ShowTasksAsync();
        }
        else Error = res?.Error switch
        {
            "not_found" => "Token topilmadi",
            "expired" => "Token muddati tugagan",
            "token_inactive" => "Token faol emas",
            null => "Serverga ulanib boʻlmadi (token uchun internet kerak)",
            _ => "Token tekshirilmadi",
        };
    }

    [RelayCommand] private void Back() => _shell.ShowLogin();
}

// ---------- Tasks ----------
public partial class TaskRow : ObservableObject
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public required string Type { get; init; }
    public required string Priority { get; init; }
    public required string StatusLabel { get; init; }
    public required string StatusKind { get; init; } // success|info|danger|ghost
    public int Findings { get; init; }
    public bool PriorityHigh => Priority == "Yuqori";
    [ObservableProperty] private bool done;
}

public partial class TasksViewModel : ObservableObject
{
    private readonly ShellViewModel _shell;
    [ObservableProperty] private ObservableCollection<TaskRow> tasks = new();
    [ObservableProperty] private string summary = "";
    [ObservableProperty] private bool busy;

    public TasksViewModel(ShellViewModel shell) => _shell = shell;

    private static (string label, string kind) StatusOf(string s) => s switch
    {
        "done" => ("Bajarilgan", "success"),
        "in_progress" => ("Jarayonda", "info"),
        "blocked" => ("Bloklangan", "danger"),
        "review" => ("Tekshiruvda", "info"),
        "returned" => ("Qaytarilgan", "ghost"),
        _ => ("Yangi", "ghost"),
    };

    public async Task LoadAsync()
    {
        Busy = true;
        var list = await _shell.Service.LoadTasksAsync();
        Tasks = new ObservableCollection<TaskRow>(list.Select(t =>
        {
            var (label, kind) = StatusOf(t.Status);
            var row = new TaskRow
            {
                Id = t.Id, Title = t.Title, Type = t.Type, Priority = t.Priority,
                StatusLabel = label, StatusKind = kind, Findings = t.Findings,
                Done = t.Status == "done",
            };
            row.PropertyChanged += (_, e) =>
            {
                if (e.PropertyName == nameof(TaskRow.Done))
                {
                    _shell.Service.ToggleTaskStatus(row.Id, row.Done ? "done" : "in_progress");
                    _shell.RefreshCounts();
                    _shell.ShowToast(row.Done ? $"{row.Id} bajarildi — sync kutilmoqda" : $"{row.Id} jarayonda");
                }
            };
            return row;
        }));
        var inProg = Tasks.Count(t => t.StatusKind == "info");
        var fresh = Tasks.Count(t => t.StatusLabel == "Yangi");
        Summary = $"{Tasks.Count} ta vazifa · {inProg} jarayonda · {fresh} yangi";
        Busy = false;
        _shell.RefreshCounts();
    }

    [RelayCommand] private async Task SyncNowAsync()
    {
        var r = await _shell.Service.SyncAsync();
        if (_shell.HandleSyncResult(r)) return;
        _shell.ShowToast(r.Online ? $"Sync: {r.Created} yuborildi" : "Server oflayn");
        if (r.Online) { _shell.NoteSynced(r.Created); _shell.RefreshCounts(); }
    }

    [RelayCommand] private void NewFinding(TaskRow? row)
    {
        var t = row ?? Tasks.FirstOrDefault();
        if (t is not null) _shell.ShowNewFinding(t.Id, t.Title);
    }
}

// ---------- Finding (create) ----------
public partial class FindingViewModel : ObservableObject
{
    private readonly ShellViewModel _shell;
    public string TaskId { get; }
    public string TaskTitle { get; }
    public string[] Severities { get; } = ["critical", "high", "medium", "low"];

    [ObservableProperty] private string title = "";
    [ObservableProperty] private string severity = "high";
    [ObservableProperty] private double cvss = 5.0;
    [ObservableProperty] private string cwe = "CWE-284";
    [ObservableProperty] private string asset = "";
    [ObservableProperty] private string description = "";
    [ObservableProperty] private string error = "";
    [ObservableProperty] private ObservableCollection<EvidenceItem> evidence = new();

    public int EvidenceCount => Evidence.Count;

    private readonly EvidenceSelection _evidence = new();

    public FindingViewModel(ShellViewModel shell, string taskId, string taskTitle)
    {
        _shell = shell;
        TaskId = taskId;
        TaskTitle = taskTitle;
    }

    /// <summary>Stage files (from the picker or a drag-drop). Dedups; builds a chip per new file.</summary>
    public void AddFiles(IEnumerable<string> paths)
    {
        foreach (var p in paths)
        {
            if (!File.Exists(p)) continue;
            if (!_evidence.Add(p)) continue;
            var item = EvidenceItem.From(p);
            item.RemoveCommand = new RelayCommand(() => RemoveEvidence(item));
            Evidence.Add(item);
        }
        OnPropertyChanged(nameof(EvidenceCount));
    }

    private void RemoveEvidence(EvidenceItem item)
    {
        _evidence.Remove(item.Path);
        Evidence.Remove(item);
        OnPropertyChanged(nameof(EvidenceCount));
    }

    [RelayCommand]
    private void Attach()
    {
        var dlg = new OpenFileDialog { Title = "Dalil biriktirish", Multiselect = true };
        if (dlg.ShowDialog() == true) AddFiles(dlg.FileNames);
    }

    private bool Validate()
    {
        Error = "";
        if (Title.Trim().Length < 3) { Error = "Sarlavha kamida 3 ta belgi"; return false; }
        if (Cvss is < 0 or > 10) { Error = "CVSS 0–10 oraligʻida"; return false; }
        return true;
    }

    private QueuedFinding Persist()
    {
        var f = _shell.Service.CaptureFinding(TaskId, Title.Trim(), Severity, Cvss, Cwe.Trim(),
            Asset.Trim(), "manual", Description.Trim());
        foreach (var p in _evidence.Paths)
            try { _shell.Service.CaptureEvidence(f.IdempotencyKey, p); } catch { /* skip unreadable */ }
        _shell.RefreshCounts();
        return f;
    }

    [RelayCommand]
    private void SaveLocal()
    {
        if (!Validate()) return;
        Persist();
        _shell.ShowToast("Finding lokal saqlandi — sinxronlash kutilmoqda");
        _shell.NavFindingsCommand.Execute(null);
    }

    [RelayCommand]
    private async Task SendAsync()
    {
        if (!Validate()) return;
        Persist();
        var r = await _shell.Service.SyncAsync();
        if (_shell.HandleSyncResult(r)) return;
        _shell.ShowToast(r.Online ? $"Finding yuborildi ({r.Created})" : "Lokal saqlandi — server oflayn");
        if (r.Online) _shell.NoteSynced(r.Created);
        _shell.NavFindingsCommand.Execute(null);
    }

    [RelayCommand] private void Cancel() => _shell.NavFindingsCommand.Execute(null);
}

/// <summary>One staged evidence file shown as a chip (glyph or image thumbnail + remove).</summary>
public sealed class EvidenceItem
{
    public required string Path { get; init; }
    public required string Name { get; init; }
    public required string SizeLabel { get; init; }
    public required string Glyph { get; init; }
    public ImageSource? Thumbnail { get; init; }
    public IRelayCommand RemoveCommand { get; set; } = null!;

    public static EvidenceItem From(string path)
    {
        var name = System.IO.Path.GetFileName(path);
        long size = 0;
        try { size = new FileInfo(path).Length; } catch { /* unreadable → 0 */ }
        return new EvidenceItem
        {
            Path = path,
            Name = name,
            SizeLabel = HumanSize(size),
            Glyph = EvidencePreview.Glyph(null, name),
            Thumbnail = MakeThumbnail(path, name),
        };
    }

    private static ImageSource? MakeThumbnail(string path, string name)
    {
        if (!EvidencePreview.IsImage(null, name)) return null;
        try
        {
            var bmp = new BitmapImage();
            bmp.BeginInit();
            bmp.CacheOption = BitmapCacheOption.OnLoad;            // don't lock the file
            bmp.CreateOptions = BitmapCreateOptions.IgnoreColorProfile;
            bmp.DecodePixelWidth = 56;                            // small — chip-sized
            bmp.UriSource = new Uri(path);
            bmp.EndInit();
            bmp.Freeze();
            return bmp;
        }
        catch { return null; }                                   // corrupt/huge → fall back to glyph
    }

    internal static string HumanSize(long b) =>
        b >= 1_048_576 ? $"{b / 1_048_576.0:0.#} MB" : b >= 1024 ? $"{b / 1024.0:0.#} KB" : $"{b} B";
}

// ---------- Findings (local list) ----------
public sealed class FindingRow
{
    public required string Title { get; init; }
    public required string SeverityCode { get; init; }
    public required string SeverityLabel { get; init; }
    public required double Cvss { get; init; }
    public required string TaskId { get; init; }
    public string? Cwe { get; init; }
    public string? Asset { get; init; }
    public required int EvidenceCount { get; init; }
    public required string StateKey { get; init; }   // draft|syncing|sent|error
    public required string StateKind { get; init; }   // warning|info|success|danger → tag colour
    public required string StateGlyph { get; init; }
    public required string StateLabel { get; init; }
    public bool HasEvidence => EvidenceCount > 0;
    public string CvssText => Cvss.ToString("0.0", System.Globalization.CultureInfo.InvariantCulture);
    public string EvidenceText => $"{EvidenceCount} dalil";
}

public partial class FindingsListViewModel : ObservableObject
{
    private readonly ShellViewModel _shell;
    private List<FindingRow> _all = new();

    [ObservableProperty] private ObservableCollection<FindingRow> findings = new();
    [ObservableProperty] private string activeFilter = "all";
    [ObservableProperty] private string searchText = "";
    [ObservableProperty] private bool isEmpty;
    [ObservableProperty] private int countAll;
    [ObservableProperty] private int countDraft;
    [ObservableProperty] private int countSyncing;
    [ObservableProperty] private int countSent;
    [ObservableProperty] private int countError;

    public FindingsListViewModel(ShellViewModel shell)
    {
        _shell = shell;
        Reload();
    }

    private void Reload()
    {
        // evidence count per finding (matched by the finding's offline idempotency key)
        var byKey = _shell.Service.AllEvidence()
            .Where(e => e.FindingKey is not null)
            .GroupBy(e => e.FindingKey!)
            .ToDictionary(g => g.Key, g => g.Count());

        _all = _shell.Service.AllFindings().Select(f =>
        {
            var st = FindingStatus.Of(f.State);
            byKey.TryGetValue(f.IdempotencyKey, out var ec);
            return new FindingRow
            {
                Title = f.Input.Title,
                SeverityCode = f.Input.Severity,
                SeverityLabel = SeverityText.Uz(f.Input.Severity),
                Cvss = f.Input.Cvss,
                TaskId = f.Input.TaskId,
                Cwe = f.Input.Cwe,
                Asset = f.Input.Asset,
                EvidenceCount = ec,
                StateKey = st.Key,
                StateKind = st.Kind,
                StateGlyph = st.Glyph,
                StateLabel = st.Label,
            };
        }).ToList();

        CountAll = _all.Count;
        CountDraft = _all.Count(r => r.StateKey == "draft");
        CountSyncing = _all.Count(r => r.StateKey == "syncing");
        CountSent = _all.Count(r => r.StateKey == "sent");
        CountError = _all.Count(r => r.StateKey == "error");
        Apply();
    }

    partial void OnActiveFilterChanged(string value) => Apply();
    partial void OnSearchTextChanged(string value) => Apply();

    private void Apply()
    {
        var list = _all
            .Where(r => FindingFilter.Matches(ActiveFilter, r.StateKey, SearchText, r.Title, r.Asset, r.Cwe))
            .ToList();
        Findings = new ObservableCollection<FindingRow>(list);
        IsEmpty = list.Count == 0;
    }

    [RelayCommand] private void SetFilter(string key) => ActiveFilter = key;

    [RelayCommand] private async Task NewFinding()
    {
        // Pick the first assigned task as the context.
        var tasks = await _shell.Service.LoadTasksAsync();
        var t = tasks.FirstOrDefault();
        if (t is not null) _shell.ShowNewFinding(t.Id, t.Title);
        else _shell.ShowToast("Avval vazifa yuklanishi kerak");
    }
}

// ---------- Files (local evidence) ----------
public partial class FileTile
{
    public required string Name { get; init; }
    public required string Glyph { get; init; }
    public required string SizeLabel { get; init; }
    public required string StateLabel { get; init; }
    public required string StateKind { get; init; } // success|info|danger|ghost → tag colour
}

public partial class FilesViewModel : ObservableObject
{
    private readonly ShellViewModel _shell;
    [ObservableProperty] private ObservableCollection<FileTile> files = new();

    public FilesViewModel(ShellViewModel shell)
    {
        _shell = shell;
        Reload();
    }

    private void Reload() => Files = new ObservableCollection<FileTile>(
        _shell.Service.AllEvidence().Select(e => new FileTile
        {
            Name = e.Filename,
            Glyph = EvidencePreview.Glyph(e.Mime, e.Filename),
            SizeLabel = Human(e.SizeBytes),
            StateLabel = StateLabel(e.State),
            StateKind = StateKind(e.State),
        }));

    private static string StateLabel(SyncState s) => s switch
    {
        SyncState.Synced => "synced", SyncState.Syncing => "uploading",
        SyncState.Failed => "failed", _ => "pending",
    };

    private static string StateKind(SyncState s) => s switch
    {
        SyncState.Synced => "success", SyncState.Syncing => "info",
        SyncState.Failed => "danger", _ => "ghost",
    };

    private static string Human(long b) =>
        b >= 1_048_576 ? $"{b / 1_048_576.0:0.#} MB" : b >= 1024 ? $"{b / 1024.0:0.#} KB" : $"{b} B";

    /// <summary>Capture files as global evidence (picker or drag-drop). Reloads the grid.</summary>
    public void AddFiles(IEnumerable<string> paths)
    {
        var added = false;
        foreach (var p in paths)
            try { if (File.Exists(p)) { _shell.Service.CaptureEvidence(null, p); added = true; } }
            catch { /* skip unreadable */ }
        if (!added) return;
        Reload();
        _shell.RefreshCounts();
    }

    [RelayCommand]
    private void Attach()
    {
        var dlg = new OpenFileDialog { Title = "Fayl biriktirish", Multiselect = true };
        if (dlg.ShowDialog() == true) AddFiles(dlg.FileNames);
    }
}

// ---------- Sync ----------
public partial class SyncRow : ObservableObject
{
    public required string Key { get; init; }
    public required string Item { get; init; }
    public required string Size { get; init; }
    [ObservableProperty] private string status = "Navbatda";
    [ObservableProperty] private int percent;
}

public partial class SyncViewModel : ObservableObject
{
    private readonly ShellViewModel _shell;
    [ObservableProperty] private ObservableCollection<SyncRow> queue = new();
    [ObservableProperty] private string bannerSub = "";
    [ObservableProperty] private string logs = "";
    [ObservableProperty] private bool busy;

    public SyncViewModel(ShellViewModel shell)
    {
        _shell = shell;
        Reload();
    }

    private void Reload()
    {
        var rows = new List<SyncRow>();
        foreach (var f in _shell.Service.AllFindings().Where(f => f.State == SyncState.Pending))
            rows.Add(new SyncRow { Key = f.IdempotencyKey, Item = $"Finding — {f.Input.Title}", Size = "—" });
        foreach (var e in _shell.Service.AllEvidence().Where(e => e.State == SyncState.Pending))
            rows.Add(new SyncRow { Key = e.Id, Item = e.Filename, Size = Human(e.SizeBytes) });
        foreach (var ts in _shell.Service.PendingTaskStatus())
            rows.Add(new SyncRow { Key = ts.TaskId, Item = $"Vazifa {ts.TaskId} — status: {ts.ToStatus}", Size = "1 KB" });
        Queue = new ObservableCollection<SyncRow>(rows);
        BannerSub = _shell.LastSyncText;
        Logs = string.Join("\n", _shell.Service.Logs(40).Select(l => $"[{l.Ts}] {l.Level,-5} {l.Message}"));
    }

    private static string Human(long b) =>
        b >= 1_048_576 ? $"{b / 1_048_576.0:0.#} MB" : b >= 1024 ? $"{b / 1024.0:0.#} KB" : $"{b} B";

    [RelayCommand]
    private async Task SyncNowAsync()
    {
        Busy = true;
        // Progress<T> here captures the UI context → live bar updates on each report.
        var progress = new Progress<Auditor.Agent.Core.Sync.SyncProgress>(sp =>
        {
            var row = Queue.FirstOrDefault(r => r.Key == sp.Key);
            if (row is null) return;
            row.Percent = sp.Percent;
            row.Status = sp.State switch
            {
                "synced" => "Yuborildi",
                "failed" => "Xato",
                _ => $"Yuborilmoqda {sp.Percent}%",
            };
        });

        var r = await _shell.Service.SyncAsync(progress);
        Busy = false;
        if (_shell.HandleSyncResult(r))
        {
            Reload();
            return;
        }
        _shell.ShowToast(r.Online
            ? $"{r.Created} finding, {r.EvidenceSent} fayl, {r.TasksSent} vazifa yuborildi"
            : "Server oflayn — keyinroq");
        if (r.Online) { _shell.NoteSynced(r.Created); _shell.RefreshCounts(); }
        Reload();
    }
}

// ---------- Local log ----------
public partial class LogViewModel : ObservableObject
{
    [ObservableProperty] private string logs = "";

    public LogViewModel(ShellViewModel shell) =>
        Logs = string.Join("\n", shell.Service.Logs(200).Select(l => $"[{l.Ts}] {l.Level,-5} {l.Message}"));
}

// ---------- Settings ----------
public partial class SettingsViewModel : ObservableObject
{
    private readonly ShellViewModel _shell;
    [ObservableProperty] private string serverUrl;
    [ObservableProperty] private int syncInterval;
    [ObservableProperty] private string encryption = Auditor.Agent.Core.AgentService.EncryptionLabel;
    [ObservableProperty] private string versionLabel;
    [ObservableProperty] private string updateLabel = "";

    public SettingsViewModel(ShellViewModel shell)
    {
        _shell = shell;
        ServerUrl = shell.Service.ServerUrl;
        SyncInterval = shell.Service.SyncIntervalMinutes;
        VersionLabel = $"v{shell.Service.AgentVersion}";
    }

    [RelayCommand]
    private void Save()
    {
        _shell.Service.SetServerUrl(ServerUrl);
        _shell.Service.SetSyncInterval(SyncInterval);
        _shell.ShowToast("Sozlamalar saqlandi (server manzili keyingi ishga tushishda qoʻllanadi)");
    }

    [RelayCommand]
    private async Task CheckUpdateAsync()
    {
        var (available, latest) = await _shell.Service.CheckUpdateAsync();
        UpdateLabel = available
            ? $"Yangi versiya mavjud: v{latest} — web /agent dan yuklab oling"
            : "Eng soʻnggi versiya oʻrnatilgan";
        _shell.ShowToast(UpdateLabel);
    }

    [RelayCommand] private async Task LogoutAsync() => await _shell.DoLogoutAsync();
}
