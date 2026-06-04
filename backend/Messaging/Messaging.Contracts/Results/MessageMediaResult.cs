using Messaging.Contracts.DTOs;

namespace Messaging.Contracts.Results;

public record MessageMediaResult
{
    public bool Succeeded { get; init; }
    public MessageMediaDto? MessageMedia { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
