using Facade.MessagingManagement.Contracts.DTOs;

namespace Facade.MessagingManagement.Contracts.Realtime;

public record MessageMediaAttachedRealtimeDto
{
    public Guid ChatId { get; init; }

    public Guid MessageId { get; init; }

    public MessageMediaDto Media { get; init; } = default!;
}
