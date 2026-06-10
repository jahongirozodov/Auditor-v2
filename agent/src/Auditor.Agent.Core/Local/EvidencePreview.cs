namespace Auditor.Agent.Core.Local;

/// <summary>
/// Pure helpers for presenting an evidence file: whether it is a previewable image,
/// and which Segoe MDL2 glyph represents its kind. Kept free of WPF types so the UI
/// (thumbnails) stays in the Desktop project and this stays unit-testable.
/// </summary>
public static class EvidencePreview
{
    private static readonly string[] ImageExt =
        [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".tif", ".tiff"];

    // Segoe MDL2 Assets code points (built from ints so the source stays ASCII-clean).
    private static readonly string GlyphPicture = char.ConvertFromUtf32(0xE8B9);
    private static readonly string GlyphEthernet = char.ConvertFromUtf32(0xE839);
    private static readonly string GlyphDocument = char.ConvertFromUtf32(0xE8A5);
    private static readonly string GlyphGrid = char.ConvertFromUtf32(0xE80A);
    private static readonly string GlyphArchive = char.ConvertFromUtf32(0xE8B7);
    private static readonly string GlyphPage = char.ConvertFromUtf32(0xE7C3);

    /// <summary>True when the file is a raster image we can render a thumbnail for.</summary>
    public static bool IsImage(string? mime, string filename)
    {
        if (!string.IsNullOrEmpty(mime) && mime.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return true;
        var ext = Path.GetExtension(filename).ToLowerInvariant();
        return Array.IndexOf(ImageExt, ext) >= 0;
    }

    /// <summary>A Segoe MDL2 Assets glyph (as a string) for the file's kind.</summary>
    public static string Glyph(string? mime, string filename)
    {
        if (IsImage(mime, filename)) return GlyphPicture;
        var ext = Path.GetExtension(filename).ToLowerInvariant();
        return ext switch
        {
            ".pcap" or ".pcapng" or ".cap" => GlyphEthernet,
            ".txt" or ".log" or ".cfg" or ".conf" or ".ini" or ".md" => GlyphDocument,
            ".csv" or ".xlsx" or ".xls" => GlyphGrid,
            ".zip" or ".7z" or ".rar" or ".tar" or ".gz" => GlyphArchive,
            ".pdf" => GlyphDocument,
            _ => GlyphPage,
        };
    }
}
