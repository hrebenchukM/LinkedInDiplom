namespace Professional.Contracts.DTOs;

// DTO компании
public record CompanyDto
{
    public Guid Id { get; init; }

    public string OwnerUserId { get; init; } = default!;

    public string Name { get; init; } = default!;

    public string? LogoUrl { get; init; }

    public string? Industry { get; init; }

    public string? Location { get; init; }

    public string? WebsiteUrl { get; init; }

    public string? Description { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}