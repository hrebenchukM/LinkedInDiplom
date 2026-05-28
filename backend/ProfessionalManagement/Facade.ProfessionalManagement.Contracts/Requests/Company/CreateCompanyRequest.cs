using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Company;

// Запрос на создание компании
public record CreateCompanyRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = default!;

    [Url]
    [MaxLength(500)]
    public string? LogoUrl { get; init; }

    [MaxLength(200)]
    public string? Industry { get; init; }

    [MaxLength(200)]
    public string? Location { get; init; }

    [MaxLength(500)]
    [Url]
    public string? WebsiteUrl { get; init; }

    [MaxLength(4000)]
    public string? Description { get; init; }
}