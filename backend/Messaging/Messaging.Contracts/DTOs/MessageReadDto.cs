namespace Messaging.Contracts.DTOs;

public record MessageReadDto
{
    public Guid Id { get; init; }
    public Guid MessageId { get; init; }
    public string UserId { get; init; } = default!;
    public DateTime ReadAt { get; init; }
}
