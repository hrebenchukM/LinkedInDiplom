namespace Professional.Contracts.DTOs;

// DTO языка пользователя
public record UserLanguageDto
{
    public Guid Id { get; init; }

    // Id пользователя из Identity
    public string UserId { get; init; } = default!;

    public Guid LanguageId { get; init; }

    public string? Level { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
