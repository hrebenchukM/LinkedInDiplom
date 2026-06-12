using Messaging.Contracts.DTOs;

namespace Messaging.Contracts.Results;

public record UserChatsResult
{
    public IReadOnlyCollection<ChatDto> Items { get; init; } = Array.Empty<ChatDto>();

    public int TotalCount { get; init; }
}
