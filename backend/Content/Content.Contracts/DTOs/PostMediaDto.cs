namespace Content.Contracts.DTOs;

// DTO связи поста и медиа
public record PostMediaDto
{
    public Guid Id { get; init; }

    public Guid PostId { get; init; }

    public Guid MediaId { get; init; }

    public DateTime CreatedAt { get; init; }

    public MediaDto? Media { get; init; }
}
