namespace Facade.ProfileManagement.Contracts.DTOs;

// DTO профиля для фасада ProfileManagement.
// Именно эту модель будет видеть frontend / Swagger.
public record ProfileDto
{
    public Guid Id { get; init; }

    public string UserId { get; init; } = default!;

    public string? FirstName { get; init; }

    public string? LastName { get; init; }

    public string? FullName { get; init; }

    public string? AvatarUrl { get; init; }

    public string? HeaderUrl { get; init; }

    public string? ProfileTitle { get; init; }

    public string? Headline { get; init; }

    public string? GenInfo { get; init; }

    public string? University { get; init; }

    public string? Location { get; init; }

    public string? PortfolioUrl { get; init; }

    public bool IsCompany { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}