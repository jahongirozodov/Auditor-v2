using System.IO;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Input;
using System.Windows.Interop;
using Microsoft.Web.WebView2.Core;

namespace Auditor.Agent.Desktop;

public partial class MainWindow : Window
{
    private readonly int _port;

    [DllImport("dwmapi.dll")]
    private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

    public MainWindow(int port)
    {
        _port = port;
        InitializeComponent();
        Loaded += async (_, _) => await InitWebViewAsync();
    }

    protected override void OnSourceInitialized(EventArgs e)
    {
        base.OnSourceInitialized(e);
        var hwnd = new WindowInteropHelper(this).Handle;
        int pref = 2; // DWMWCP_ROUND
        DwmSetWindowAttribute(hwnd, 33, ref pref, Marshal.SizeOf(pref));
    }

    private async Task InitWebViewAsync()
    {
        var udFolder = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "AuditorAgent", "WebView2");
        var env = await CoreWebView2Environment.CreateAsync(userDataFolder: udFolder);
        await WebView.EnsureCoreWebView2Async(env);
        WebView.CoreWebView2.Settings.AreDevToolsEnabled = false;
        WebView.CoreWebView2.Settings.IsStatusBarEnabled = false;
        WebView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
        WebView.CoreWebView2.Navigate($"http://localhost:{_port}/");
    }

    private void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        if (e.ClickCount == 2) ToggleMaximize();
        else if (e.ButtonState == MouseButtonState.Pressed) DragMove();
    }

    private void Minimize_Click(object sender, RoutedEventArgs e) => WindowState = WindowState.Minimized;
    private void Maximize_Click(object sender, RoutedEventArgs e) => ToggleMaximize();
    private void Close_Click(object sender, RoutedEventArgs e) => Close();

    private void ToggleMaximize() =>
        WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
}
