using Auditor.Agent.Core.Local;
using Xunit;

namespace Auditor.Agent.Tests;

public class SeverityTextTests
{
    [Theory]
    [InlineData("critical", "Kritik")]
    [InlineData("high", "Yuqori")]
    [InlineData("HIGH", "Yuqori")]
    [InlineData("low", "Past")]
    public void Maps_known_codes_to_uzbek(string code, string expected) =>
        Assert.Equal(expected, SeverityText.Uz(code));

    [Fact]
    public void Unknown_code_passes_through() => Assert.Equal("xyz", SeverityText.Uz("xyz"));
}

public class FindingStatusTests
{
    [Theory]
    [InlineData(SyncState.Synced, "Yuborilgan", "success", "sent")]
    [InlineData(SyncState.Syncing, "Yuborilmoqda", "info", "syncing")]
    [InlineData(SyncState.Failed, "Xato", "danger", "error")]
    [InlineData(SyncState.Pending, "Lokal qoralama", "warning", "draft")]
    public void Maps_state_to_label_kind_key(SyncState s, string label, string kind, string key)
    {
        var ui = FindingStatus.Of(s);
        Assert.Equal(label, ui.Label);
        Assert.Equal(kind, ui.Kind);
        Assert.Equal(key, ui.Key);
        Assert.False(string.IsNullOrEmpty(ui.Glyph));
    }
}

public class FindingFilterTests
{
    [Fact]
    public void All_filter_passes_any_state() =>
        Assert.True(FindingFilter.Matches("all", "draft", null, "title"));

    [Fact]
    public void State_filter_excludes_other_states()
    {
        Assert.True(FindingFilter.Matches("sent", "sent", null, "t"));
        Assert.False(FindingFilter.Matches("sent", "draft", null, "t"));
    }

    [Fact]
    public void Search_matches_any_field_case_insensitive()
    {
        Assert.True(FindingFilter.Matches("all", "draft", "core", "RDP off", "FW-CORE-01", "CWE-284"));
        Assert.True(FindingFilter.Matches("all", "draft", "cwe-284", "RDP off", "FW-CORE-01", "CWE-284"));
        Assert.False(FindingFilter.Matches("all", "draft", "zzz", "RDP off", "FW-CORE-01", "CWE-284"));
    }

    [Fact]
    public void Search_and_filter_combine()
    {
        Assert.True(FindingFilter.Matches("error", "error", "telnet", "Telnet open", "SW-1", "CWE-319"));
        Assert.False(FindingFilter.Matches("error", "sent", "telnet", "Telnet open", "SW-1", "CWE-319"));
    }
}
