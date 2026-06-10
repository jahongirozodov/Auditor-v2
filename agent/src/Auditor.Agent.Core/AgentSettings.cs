namespace Auditor.Agent.Core;

/// <summary>
/// Agent configuration. BaseUrl is user-configurable (TZ known-limit was a hard-coded
/// URL); defaults point at the local dev server. DbPath defaults under %LOCALAPPDATA%.
/// </summary>
public sealed class AgentSettings
{
    public string BaseUrl { get; set; } = "http://localhost:3000";
    public string AgentVersion { get; set; } = "1.0.0";
    public int SyncIntervalMinutes { get; set; } = 5;
    public string DbPath { get; set; } = DefaultDbPath();

    public static string DefaultDbPath()
    {
        var dir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "Auditor.Agent");
        Directory.CreateDirectory(dir);
        return Path.Combine(dir, "agent.db");
    }
}
