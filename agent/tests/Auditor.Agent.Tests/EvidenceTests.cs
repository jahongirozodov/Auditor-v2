using Auditor.Agent.Core.Local;
using Xunit;

namespace Auditor.Agent.Tests;

public class EvidenceSelectionTests
{
    [Fact]
    public void Adds_a_new_path()
    {
        var sel = new EvidenceSelection();
        Assert.True(sel.Add(@"C:\evidence\screenshot.png"));
        Assert.Equal(1, sel.Count);
    }

    [Fact]
    public void Dedups_the_same_path()
    {
        var sel = new EvidenceSelection();
        Assert.True(sel.Add(@"C:\evidence\fw-config.txt"));
        Assert.False(sel.Add(@"C:\evidence\fw-config.txt"));
        Assert.Equal(1, sel.Count);
    }

    [Fact]
    public void Dedup_is_case_insensitive()
    {
        var sel = new EvidenceSelection();
        sel.Add(@"C:\Evidence\Cap.pcap");
        Assert.False(sel.Add(@"c:\evidence\cap.pcap"));
        Assert.Equal(1, sel.Count);
    }

    [Fact]
    public void Remove_keeps_the_remaining_paths_consistent()
    {
        var sel = new EvidenceSelection();
        sel.Add(@"C:\a.png");
        sel.Add(@"C:\b.txt");
        sel.Remove(@"C:\a.png");
        Assert.Equal(1, sel.Count);
        Assert.Equal(@"C:\b.txt", Assert.Single(sel.Paths));
    }

    [Fact]
    public void Ignores_blank_paths()
    {
        var sel = new EvidenceSelection();
        Assert.False(sel.Add("   "));
        Assert.Equal(0, sel.Count);
    }
}

public class EvidencePreviewTests
{
    [Theory]
    [InlineData("shot.png")]
    [InlineData("photo.JPG")]
    [InlineData("scan.jpeg")]
    public void Detects_image_by_extension(string name) =>
        Assert.True(EvidencePreview.IsImage(null, name));

    [Theory]
    [InlineData("notes.txt")]
    [InlineData("capture.pcap")]
    [InlineData("report.pdf")]
    public void Non_images_are_not_images(string name) =>
        Assert.False(EvidencePreview.IsImage(null, name));

    [Fact]
    public void Mime_overrides_extension_for_images() =>
        Assert.True(EvidencePreview.IsImage("image/png", "blob.bin"));

    [Fact]
    public void Image_and_document_glyphs_differ()
    {
        var image = EvidencePreview.Glyph(null, "shot.png");
        var doc = EvidencePreview.Glyph(null, "notes.txt");
        Assert.NotEqual(image, doc);
        Assert.False(string.IsNullOrEmpty(image));
    }
}
