using System.Net;
using System.Text;

namespace Auditor.Agent.Tests;

/// <summary>Test double: maps a request to a canned (status, json) reply by path.</summary>
public sealed class StubHandler : HttpMessageHandler
{
    private readonly Func<HttpRequestMessage, (HttpStatusCode, string)> _responder;
    public readonly List<HttpRequestMessage> Requests = [];
    public readonly List<string> Bodies = [];

    public StubHandler(Func<HttpRequestMessage, (HttpStatusCode, string)> responder) => _responder = responder;

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        Requests.Add(request);
        Bodies.Add(request.Content is null ? "" : await request.Content.ReadAsStringAsync(ct));
        var (code, json) = _responder(request);
        return new HttpResponseMessage(code) { Content = new StringContent(json, Encoding.UTF8, "application/json") };
    }

    public HttpClient Client() => new(this) { BaseAddress = new Uri("http://test.local") };
}
