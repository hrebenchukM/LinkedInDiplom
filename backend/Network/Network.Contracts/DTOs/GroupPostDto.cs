namespace Network.Contracts.DTOs;

// DTO связи группы и поста
public record GroupPostDto
{
    public Guid Id { get; init; }

    public Guid GroupId { get; init; }

    public Guid PostId { get; init; }

    public DateTime CreatedAt { get; init; }
}
