using System.Windows;
using System.Windows.Controls;
using Auditor.Agent.Desktop.ViewModels;

namespace Auditor.Agent.Desktop.Views;

public partial class FindingView : UserControl
{
    public FindingView() => InitializeComponent();

    private void Root_DragOver(object sender, DragEventArgs e)
    {
        e.Effects = e.Data.GetDataPresent(DataFormats.FileDrop)
            ? DragDropEffects.Copy
            : DragDropEffects.None;
        e.Handled = true;
    }

    private void Root_Drop(object sender, DragEventArgs e)
    {
        if (e.Data.GetDataPresent(DataFormats.FileDrop)
            && e.Data.GetData(DataFormats.FileDrop) is string[] files
            && DataContext is FindingViewModel vm)
            vm.AddFiles(files);
    }
}
