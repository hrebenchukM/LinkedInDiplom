namespace Professional.Contracts.DTOs;

// DTO учебного заведения
public record AcademyDto
{
    public Guid Id { get; init; }

    public string Name { get; init; } = default!;

    public string? LogoUrl { get; init; }

    public string? WebsiteUrl { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
