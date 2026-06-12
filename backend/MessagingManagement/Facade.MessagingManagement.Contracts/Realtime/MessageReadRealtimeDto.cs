namespace Facade.MessagingManagement.Contracts.Realtime;

public record MessageReadRealtimeDto
{
    public Guid ChatId { get; init; }

    public Guid Id { get; init; }

    public Guid MessageId { get; init; }

    public string UserId { get; init; } = default!;

    public DateTime ReadAt { get; init; }
}
