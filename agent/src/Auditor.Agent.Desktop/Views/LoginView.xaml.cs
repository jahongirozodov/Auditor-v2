using System.Windows;
using System.Windows.Controls;
using Auditor.Agent.Desktop.ViewModels;

namespace Auditor.Agent.Desktop.Views;

public partial class LoginView : UserControl
{
    public LoginView() => InitializeComponent();

    // PasswordBox.Password can't be data-bound (security) — push it to the VM here.
    private void Pwd_PasswordChanged(object sender, RoutedEventArgs e)
    {
        if (DataContext is LoginViewModel vm) vm.Password = Pwd.Password;
    }
}
