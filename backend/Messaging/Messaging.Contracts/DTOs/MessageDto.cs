namespace Messaging.Contracts.DTOs;

public record MessageDto
{
    public Guid Id { get; init; }
    public Guid ChatId { get; init; }
    public string SenderId { get; init; } = default!;
    public string Content { get; init; } = default!;
    public DateTime CreatedAt { get; init; }
    public DateTime? EditedAt { get; init; }
    public IReadOnlyCollection<MessageMediaDto>? Media { get; init; }
}
