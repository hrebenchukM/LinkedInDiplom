using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Company;

// Запрос на полное обновление компании
public record UpdateCompanyRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = default!;

    public string? LogoUrl { get; init; }

    [MaxLength(200)]
    public string? Industry { get; init; }

    [MaxLength(200)]
    public string? Location { get; init; }

    [MaxLength(500)]
    public string? WebsiteUrl { get; init; }

    public string? Description { get; init; }
}