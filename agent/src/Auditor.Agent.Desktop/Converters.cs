using System.Globalization;
using System.Windows;
using System.Windows.Data;
using System.Windows.Media;
using Auditor.Agent.Core.Local;

namespace Auditor.Agent.Desktop;

/// <summary>Non-empty string → Visible, else Collapsed.</summary>
public sealed class StringToVisibilityConverter : IValueConverter
{
    public object Convert(object? value, Type t, object? p, CultureInfo c) =>
        string.IsNullOrWhiteSpace(value as string) ? Visibility.Collapsed : Visibility.Visible;
    public object ConvertBack(object? value, Type t, object? p, CultureInfo c) => throw new NotSupportedException();
}

/// <summary>Inverts a bool (e.g. IsEnabled = !Busy).</summary>
public sealed class InverseBooleanConverter : IValueConverter
{
    public object Convert(object? value, Type t, object? p, CultureInfo c) => value is not true;
    public object ConvertBack(object? value, Type t, object? p, CultureInfo c) => value is not true;
}

/// <summary>Tag/status kind string → tinted brush (success/info/danger/warning/ghost).</summary>
public sealed class KindToBrushConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var bg = (value as string) switch
        {
            "success" => "SuccessBg",
            "info" => "InfoBg",
            "danger" => "DangerBg",
            "warning" => "WarningBg",
            _ => "GhostBg",
        };
        return System.Windows.Application.Current.Resources[bg] as Brush ?? Brushes.Gray;
    }
    public object ConvertBack(object? value, Type t, object? p, CultureInfo c) => throw new NotSupportedException();
}

/// <summary>int &gt; 0 → Visible (count badges).</summary>
public sealed class CountToVisibilityConverter : IValueConverter
{
    public object Convert(object? value, Type t, object? p, CultureInfo c) =>
        value is int n && n > 0 ? Visibility.Visible : Visibility.Collapsed;
    public object ConvertBack(object? value, Type t, object? p, CultureInfo c) => throw new NotSupportedException();
}

/// <summary>value == parameter → true (nav-item active highlight).</summary>
public sealed class StringEqualsConverter : IValueConverter
{
    public object Convert(object? value, Type t, object? parameter, CultureInfo c) =>
        string.Equals(value as string, parameter as string, StringComparison.Ordinal);
    public object ConvertBack(object? value, Type t, object? p, CultureInfo c) => throw new NotSupportedException();
}

/// <summary>Maps a severity string to its token brush (resolved from app resources).</summary>
public sealed class SeverityToBrushConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var key = (value as string)?.ToLowerInvariant() switch
        {
            "critical" => "SevCritical",
            "high" => "SevHigh",
            "medium" => "SevMedium",
            "low" => "SevLow",
            _ => "TextMuted",
        };
        return System.Windows.Application.Current.Resources[key] as Brush ?? Brushes.Gray;
    }

    public object ConvertBack(object? value, Type t, object? p, CultureInfo c) => throw new NotSupportedException();
}

/// <summary>Empty/whitespace string → Visible (drives input placeholders), else Collapsed.</summary>
public sealed class EmptyStringToVisibilityConverter : IValueConverter
{
    public object Convert(object? value, Type t, object? p, CultureInfo c) =>
        string.IsNullOrWhiteSpace(value as string) ? Visibility.Visible : Visibility.Collapsed;
    public object ConvertBack(object? value, Type t, object? p, CultureInfo c) => throw new NotSupportedException();
}

/// <summary>Tag/status kind → its solid accent brush (for coloured status text/glyph).</summary>
public sealed class KindToForegroundBrushConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var key = (value as string) switch
        {
            "success" => "Success",
            "info" => "Info",
            "danger" => "Danger",
            "warning" => "Warning",
            _ => "TextMuted",
        };
        return System.Windows.Application.Current.Resources[key] as Brush ?? Brushes.Gray;
    }
    public object ConvertBack(object? value, Type t, object? p, CultureInfo c) => throw new NotSupportedException();
}

/// <summary>Severity code → Uzbek label (dropdown items; the bound value stays the code).</summary>
public sealed class SeverityToLabelConverter : IValueConverter
{
    public object Convert(object? value, Type t, object? p, CultureInfo c) => SeverityText.Uz(value as string);
    public object ConvertBack(object? value, Type t, object? p, CultureInfo c) => throw new NotSupportedException();
}

/// <summary>online → green dot, offline → muted.</summary>
public sealed class OnlineToBrushConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var key = value is true ? "Success" : "TextMuted";
        return System.Windows.Application.Current.Resources[key] as Brush ?? Brushes.Gray;
    }

    public object ConvertBack(object? value, Type t, object? p, CultureInfo c) => throw new NotSupportedException();
}
