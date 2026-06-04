using Messaging.Contracts.DTOs;

namespace Messaging.Contracts.Results;

public record MessageResult
{
    public bool Succeeded { get; init; }
    public MessageDto? Message { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
