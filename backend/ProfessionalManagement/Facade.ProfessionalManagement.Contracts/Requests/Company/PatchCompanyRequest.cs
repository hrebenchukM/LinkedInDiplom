namespace Facade.ProfessionalManagement.Contracts.Requests.Company;

// Запрос на частичное обновление компании.
// Если поле null — значит его не меняем.
public record PatchCompanyRequest
{
    public string? Name { get; init; }

    public string? LogoUrl { get; init; }

    public string? Industry { get; init; }

    public string? Location { get; init; }

    public string? WebsiteUrl { get; init; }

    public string? Description { get; init; }
}