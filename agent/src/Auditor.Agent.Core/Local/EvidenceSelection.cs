namespace Auditor.Agent.Core.Local;

/// <summary>
/// The set of file paths a user has staged as evidence for one finding, before they are
/// captured into the encrypted store. Dedups by full path (case-insensitive, Windows
/// filesystem semantics). Pure — no WPF — so the add/remove behaviour is unit-testable.
/// </summary>
public sealed class EvidenceSelection
{
    private readonly List<string> _paths = [];

    public IReadOnlyList<string> Paths => _paths;
    public int Count => _paths.Count;

    /// <summary>Stage a path. Returns false if it is already staged (no duplicate added).</summary>
    public bool Add(string path)
    {
        if (string.IsNullOrWhiteSpace(path)) return false;
        if (_paths.Any(p => string.Equals(p, path, StringComparison.OrdinalIgnoreCase)))
            return false;
        _paths.Add(path);
        return true;
    }

    /// <summary>Remove a staged path (no-op if absent).</summary>
    public void Remove(string path) =>
        _paths.RemoveAll(p => string.Equals(p, path, StringComparison.OrdinalIgnoreCase));
}
