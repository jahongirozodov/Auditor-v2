using System.Security.Cryptography;
using Auditor.Agent.Core.Crypto;
using Xunit;

namespace Auditor.Agent.Tests;

public class DbCipherTests
{
    [Fact]
    public void RoundTrips_a_string()
    {
        var key = DbCipher.NewKey();
        var payload = DbCipher.EncryptString("SQL injection on /login", key);
        Assert.Equal("SQL injection on /login", DbCipher.DecryptString(payload, key));
    }

    [Fact]
    public void Ciphertext_is_not_the_plaintext()
    {
        var key = DbCipher.NewKey();
        var payload = DbCipher.EncryptString("secret", key);
        Assert.DoesNotContain("secret", System.Text.Encoding.UTF8.GetString(payload));
    }

    [Fact]
    public void Tampered_payload_is_rejected()
    {
        var key = DbCipher.NewKey();
        var payload = DbCipher.EncryptString("evidence", key);
        payload[^1] ^= 0xFF; // flip a ciphertext byte
        Assert.ThrowsAny<CryptographicException>(() => DbCipher.DecryptString(payload, key));
    }

    [Fact]
    public void Wrong_key_is_rejected()
    {
        var payload = DbCipher.EncryptString("evidence", DbCipher.NewKey());
        Assert.ThrowsAny<CryptographicException>(() => DbCipher.DecryptString(payload, DbCipher.NewKey()));
    }

    [Fact]
    public void Bad_key_size_throws()
    {
        Assert.Throws<ArgumentException>(() => DbCipher.EncryptString("x", new byte[16]));
    }
}

public class TokenProtectorTests
{
    [Fact]
    public void RoundTrips_via_DPAPI()
    {
        var prot = TokenProtector.Protect("eyJ.jwt.token");
        Assert.NotEqual("eyJ.jwt.token", prot);
        Assert.Equal("eyJ.jwt.token", TokenProtector.Unprotect(prot));
    }

    [Fact]
    public void Unprotect_returns_null_on_garbage()
    {
        Assert.Null(TokenProtector.Unprotect("not-base64-or-protected"));
        Assert.Null(TokenProtector.Unprotect(null));
    }
}
