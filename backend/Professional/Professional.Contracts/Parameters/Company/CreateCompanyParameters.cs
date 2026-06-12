namespace Professional.Contracts.Parameters.Company;

// Создать компанию
public record CreateCompanyParameters
{
    public string OwnerUserId { get; init; } = default!;

    public string Name { get; init; } = default!;

    public string? LogoUrl { get; init; }

    public string? Industry { get; init; }

    public string? Location { get; init; }

    public string? WebsiteUrl { get; init; }

    public string? Description { get; init; }
}