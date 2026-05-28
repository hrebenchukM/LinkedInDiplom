using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Company;

// Запрос на частичное обновление компании.
// Если поле null — значит его не меняем.
public record PatchCompanyRequest
{
    [MaxLength(200)]
    public string? Name { get; init; }

    [Url]
    [MaxLength(500)]
    public string? LogoUrl { get; init; }

    [MaxLength(200)]
    public string? Industry { get; init; }

    [MaxLength(200)]
    public string? Location { get; init; }

    [Url]
    [MaxLength(500)]
    public string? WebsiteUrl { get; init; }

    [MaxLength(4000)]
    public string? Description { get; init; }
}