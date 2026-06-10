using System.Net;

namespace Auditor.Agent.Core.Api;

/// <summary>Lambda-backed IProgress (synchronous; preserves report order).</summary>
public sealed class DelegateProgress<T>(Action<T> on) : IProgress<T>
{
    public void Report(T value) => on(value);
}

/// <summary>
/// HttpContent that streams a byte buffer in chunks, reporting upload progress as a
/// 0–100 percent. Used for evidence uploads so the Sync queue shows a live bar.
/// </summary>
public sealed class ProgressableByteArrayContent : HttpContent
{
    private const int ChunkSize = 32 * 1024;
    private readonly byte[] _bytes;
    private readonly IProgress<int>? _progress;

    public ProgressableByteArrayContent(byte[] bytes, string mediaType, IProgress<int>? progress)
    {
        _bytes = bytes;
        _progress = progress;
        Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(mediaType);
    }

    protected override async Task SerializeToStreamAsync(Stream stream, TransportContext? context)
    {
        var total = _bytes.Length;
        var sent = 0;
        _progress?.Report(0);
        while (sent < total)
        {
            var n = Math.Min(ChunkSize, total - sent);
            await stream.WriteAsync(_bytes.AsMemory(sent, n));
            sent += n;
            _progress?.Report(total == 0 ? 100 : (int)(sent * 100L / total));
        }
        _progress?.Report(100);
    }

    protected override bool TryComputeLength(out long length)
    {
        length = _bytes.Length;
        return true;
    }
}
