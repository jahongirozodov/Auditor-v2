using System.IO;
using System.Text.Json;
using System.Windows;
using Auditor.Agent.Core;
using Auditor.Agent.Desktop.ViewModels;

namespace Auditor.Agent.Desktop;

public partial class App : Application
{
    private AgentService? _service;

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        var settings = LoadSettings();
        _service = new AgentService(settings);
        var shell = new ShellViewModel(_service);
        new MainWindow { DataContext = shell }.Show();
    }

    /// <summary>appsettings.json next to the EXE overrides defaults (e.g. BaseUrl).</summary>
    private static AgentSettings LoadSettings()
    {
        try
        {
            var path = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
            if (File.Exists(path))
            {
                var loaded = JsonSerializer.Deserialize<AgentSettings>(File.ReadAllText(path),
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (loaded is not null) return loaded;
            }
        }
        catch { /* fall back to defaults */ }
        return new AgentSettings();
    }

    protected override void OnExit(ExitEventArgs e)
    {
        _service?.Dispose();
        base.OnExit(e);
    }
}
