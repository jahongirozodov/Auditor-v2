namespace Auditor.Agent.Core.Local;

/// <summary>Uzbek-Latin label for a severity code (display only — the stored value stays the code).</summary>
public static class SeverityText
{
    public static string Uz(string? code) => code?.ToLowerInvariant() switch
    {
        "critical" => "Kritik",
        "high" => "Yuqori",
        "medium" => "Oʻrta",
        "low" => "Past",
        _ => code ?? "",
    };
}

/// <summary>Presentation of a finding's sync state: Uzbek label, tag colour kind, and a glyph.</summary>
public sealed record FindingStatusUi(string Label, string Kind, string Glyph, string Key);

public static class FindingStatus
{
    // Segoe MDL2 Assets code points (built from ints so the source stays ASCII-clean).
    private static readonly string GlyphEdit = char.ConvertFromUtf32(0xE70F);  // draft
    private static readonly string GlyphSync = char.ConvertFromUtf32(0xE72C);  // syncing
    private static readonly string GlyphCheck = char.ConvertFromUtf32(0xE73E); // sent
    private static readonly string GlyphWarn = char.ConvertFromUtf32(0xE7BA);  // error

    public static FindingStatusUi Of(SyncState s) => s switch
    {
        SyncState.Synced => new("Yuborilgan", "success", GlyphCheck, "sent"),
        SyncState.Syncing => new("Yuborilmoqda", "info", GlyphSync, "syncing"),
        SyncState.Failed => new("Xato", "danger", GlyphWarn, "error"),
        _ => new("Lokal qoralama", "warning", GlyphEdit, "draft"),
    };
}

/// <summary>Filter predicate for the local-findings list: status chip + free-text search.</summary>
public static class FindingFilter
{
    public static bool Matches(string filterKey, string stateKey, string? search, params string?[] fields)
    {
        if (filterKey != "all" && filterKey != stateKey) return false;
        if (string.IsNullOrWhiteSpace(search)) return true;
        var q = search.Trim();
        return fields.Any(f => !string.IsNullOrEmpty(f) && f.Contains(q, StringComparison.OrdinalIgnoreCase));
    }
}
