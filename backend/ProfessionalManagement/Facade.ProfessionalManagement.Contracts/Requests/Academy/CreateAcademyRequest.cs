using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Academy;

// Запрос на создание учебного заведения
public record CreateAcademyRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = default!;

    [MaxLength(500)]
    [Url]
    public string? LogoUrl { get; init; }

    [MaxLength(500)]
    [Url]
    public string? WebsiteUrl { get; init; }
}
