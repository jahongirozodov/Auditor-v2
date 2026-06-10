using System.Security.Cryptography;
using System.Text;

namespace Auditor.Agent.Core.Crypto;

/// <summary>
/// Protects the agent's bearer tokens at the Windows credential level via DPAPI
/// (CurrentUser scope), per TZ §16.3. Ciphertext is meaningless to other users and
/// other machines. Stored base64 so it can live in a text settings file.
/// </summary>
public static class TokenProtector
{
    private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("Auditor.Agent.v1");

    public static string Protect(string plaintext)
    {
        var bytes = Encoding.UTF8.GetBytes(plaintext);
        var blob = ProtectedData.Protect(bytes, Entropy, DataProtectionScope.CurrentUser);
        return Convert.ToBase64String(blob);
    }

    public static string? Unprotect(string? protectedBase64)
    {
        if (string.IsNullOrEmpty(protectedBase64)) return null;
        try
        {
            var blob = Convert.FromBase64String(protectedBase64);
            var bytes = ProtectedData.Unprotect(blob, Entropy, DataProtectionScope.CurrentUser);
            return Encoding.UTF8.GetString(bytes);
        }
        catch (Exception e) when (e is CryptographicException or FormatException)
        {
            return null; // tampered, malformed base64, or protected by a different user/machine
        }
    }
}
