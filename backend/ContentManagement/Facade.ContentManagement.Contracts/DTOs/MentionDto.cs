namespace Facade.ContentManagement.Contracts.DTOs;

// DTO упоминания в посте для frontend / Swagger
public record MentionDto
{
    public Guid Id { get; init; }

    public Guid PostId { get; init; }

    public string MentionedUserId { get; init; } = default!;

    public DateTime CreatedAt { get; init; }
}
