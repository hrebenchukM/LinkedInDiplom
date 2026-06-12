namespace Professional.Contracts.Parameters.Company;

// Частично обновить компанию
public record PatchCompanyParameters
{
    public string UserId { get; init; } = default!;

    public Guid CompanyId { get; init; }

    public string? Name { get; init; }

    public string? LogoUrl { get; init; }

    public string? Industry { get; init; }

    public string? Location { get; init; }

    public string? WebsiteUrl { get; init; }

    public string? Description { get; init; }
}