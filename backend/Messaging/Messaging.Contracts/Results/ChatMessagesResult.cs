using Messaging.Contracts.DTOs;

namespace Messaging.Contracts.Results;

public record ChatMessagesResult
{
    public IReadOnlyCollection<MessageDto> Items { get; init; } = Array.Empty<MessageDto>();

    public int TotalCount { get; init; }
}
