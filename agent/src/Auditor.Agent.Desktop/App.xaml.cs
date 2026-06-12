using System.IO;
using System.Text.Json;
using System.Windows;
using Auditor.Agent.Core;
using Auditor.Agent.Desktop.LocalApi;

namespace Auditor.Agent.Desktop;

public partial class App : Application
{
    private AgentService? _service;
    private LocalApiHost? _api;

    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        var settings = LoadSettings();
        _service = new AgentService(settings);
        _api = new LocalApiHost(_service);
        await _api.StartAsync();
        new MainWindow(_api.Port).Show();
    }

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
        catch { }
        return new AgentSettings();
    }

    protected override void OnExit(ExitEventArgs e)
    {
        try { _api?.StopAsync().GetAwaiter().GetResult(); } catch { }
        try { _service?.Dispose(); } catch { }
        base.OnExit(e);
        Environment.Exit(0);
    }
}
