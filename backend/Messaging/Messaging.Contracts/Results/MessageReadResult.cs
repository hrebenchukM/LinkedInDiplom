using Messaging.Contracts.DTOs;

namespace Messaging.Contracts.Results;

public record MessageReadResult
{
    public bool Succeeded { get; init; }
    public MessageReadDto? MessageRead { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
