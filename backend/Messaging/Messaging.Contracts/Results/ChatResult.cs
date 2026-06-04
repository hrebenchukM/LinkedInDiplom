using Messaging.Contracts.DTOs;

namespace Messaging.Contracts.Results;

public record ChatResult
{
    public bool Succeeded { get; init; }
    public ChatDto? Chat { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
