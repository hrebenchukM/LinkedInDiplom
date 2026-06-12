namespace Content.Contracts.DTOs;

// DTO хэштега
public record HashtagDto
{
    public Guid Id { get; init; }

    public string Name { get; init; } = default!;

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
