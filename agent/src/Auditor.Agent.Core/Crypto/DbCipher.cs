using System.Security.Cryptography;
using System.Text;

namespace Auditor.Agent.Core.Crypto;

/// <summary>
/// AES-GCM authenticated encryption for the local SQLite payload at rest (TZ §16.3).
/// Output layout: [12-byte nonce][16-byte tag][ciphertext]. The 32-byte key is owned
/// by the caller (stored DPAPI-protected via <see cref="TokenProtector"/>).
/// </summary>
public static class DbCipher
{
    private const int NonceSize = 12; // AesGcm.NonceByteSizes max
    private const int TagSize = 16;   // AesGcm.TagByteSizes max
    public const int KeySize = 32;    // AES-256

    public static byte[] NewKey()
    {
        var key = new byte[KeySize];
        RandomNumberGenerator.Fill(key);
        return key;
    }

    public static byte[] Encrypt(byte[] plaintext, byte[] key)
    {
        ValidateKey(key);
        var nonce = new byte[NonceSize];
        RandomNumberGenerator.Fill(nonce);
        var cipher = new byte[plaintext.Length];
        var tag = new byte[TagSize];

        using var aes = new AesGcm(key, TagSize);
        aes.Encrypt(nonce, plaintext, cipher, tag);

        var output = new byte[NonceSize + TagSize + cipher.Length];
        Buffer.BlockCopy(nonce, 0, output, 0, NonceSize);
        Buffer.BlockCopy(tag, 0, output, NonceSize, TagSize);
        Buffer.BlockCopy(cipher, 0, output, NonceSize + TagSize, cipher.Length);
        return output;
    }

    public static byte[] Decrypt(byte[] payload, byte[] key)
    {
        ValidateKey(key);
        if (payload.Length < NonceSize + TagSize)
            throw new ArgumentException("payload too short", nameof(payload));

        var nonce = new byte[NonceSize];
        var tag = new byte[TagSize];
        var cipher = new byte[payload.Length - NonceSize - TagSize];
        Buffer.BlockCopy(payload, 0, nonce, 0, NonceSize);
        Buffer.BlockCopy(payload, NonceSize, tag, 0, TagSize);
        Buffer.BlockCopy(payload, NonceSize + TagSize, cipher, 0, cipher.Length);

        var plaintext = new byte[cipher.Length];
        using var aes = new AesGcm(key, TagSize);
        aes.Decrypt(nonce, cipher, tag, plaintext); // throws CryptographicException if tampered
        return plaintext;
    }

    public static byte[] EncryptString(string text, byte[] key) =>
        Encrypt(Encoding.UTF8.GetBytes(text), key);

    public static string DecryptString(byte[] payload, byte[] key) =>
        Encoding.UTF8.GetString(Decrypt(payload, key));

    private static void ValidateKey(byte[] key)
    {
        if (key is null || key.Length != KeySize)
            throw new ArgumentException($"key must be {KeySize} bytes", nameof(key));
    }
}
