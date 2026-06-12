namespace Facade.MessagingManagement.Contracts.DTOs;

public record ChatMemberDto
{
    public Guid Id { get; init; }
    public Guid ChatId { get; init; }
    public string UserId { get; init; } = default!;
    public string? Folder { get; init; }
    public DateTime JoinedAt { get; init; }
    public DateTime? LeftAt { get; init; }
}
