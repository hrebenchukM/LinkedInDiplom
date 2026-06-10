namespace Facade.MessagingManagement.Contracts.Realtime;

public record MessageDeletedRealtimeDto
{
    public Guid ChatId { get; init; }

    public Guid MessageId { get; init; }
}
