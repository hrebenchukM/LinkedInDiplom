namespace Messaging.Contracts.DTOs;

public record ChatDto
{
    public Guid Id { get; init; }
    public string CreatedBy { get; init; } = default!;
    public DateTime CreatedAt { get; init; }
    public IReadOnlyCollection<ChatMemberDto>? Members { get; init; }
}
