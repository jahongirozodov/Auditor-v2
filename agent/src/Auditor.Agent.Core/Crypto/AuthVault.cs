using System.Security.Cryptography;
using System.Text.Json;

namespace Auditor.Agent.Core.Crypto;

/// <summary>
/// Offline local-account credential. After the first successful online login the
/// password is stored as a PBKDF2-SHA256 hash (never plaintext); later launches
/// validate offline against it. The JSON blob lives in the encrypted LocalStore.
/// </summary>
public static class AuthVault
{
    private const int Iterations = 100_000;
    private const int SaltSize = 16;
    private const int HashSize = 32;

    private sealed record Cred(string Email, string Salt, string Hash, int Iters);

    public static string Create(string email, string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Derive(password, salt, Iterations);
        var cred = new Cred(email.Trim().ToLowerInvariant(), Convert.ToBase64String(salt),
            Convert.ToBase64String(hash), Iterations);
        return JsonSerializer.Serialize(cred);
    }

    public static bool Verify(string? json, string email, string password)
    {
        if (string.IsNullOrEmpty(json)) return false;
        Cred? c;
        try { c = JsonSerializer.Deserialize<Cred>(json); }
        catch { return false; }
        if (c is null || !string.Equals(c.Email, email.Trim().ToLowerInvariant(), StringComparison.Ordinal))
            return false;

        var expected = Convert.FromBase64String(c.Hash);
        var actual = Derive(password, Convert.FromBase64String(c.Salt), c.Iters);
        return CryptographicOperations.FixedTimeEquals(expected, actual);
    }

    /// <summary>The email a stored credential belongs to (for prefilling the form), or null.</summary>
    public static string? EmailOf(string? json)
    {
        if (string.IsNullOrEmpty(json)) return null;
        try { return JsonSerializer.Deserialize<Cred>(json)?.Email; }
        catch { return null; }
    }

    private static byte[] Derive(string password, byte[] salt, int iters) =>
        Rfc2898DeriveBytes.Pbkdf2(password, salt, iters, HashAlgorithmName.SHA256, HashSize);
}
