using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Certificate;

// Запрос на полное обновление сертификата
public record UpdateCertificateRequest
{
    public Guid? AcademyId { get; init; }

    [Required]
    [MaxLength(200)]
    public string Name { get; init; } = default!;

    [MaxLength(500)]
    public string? DownloadRef { get; init; }

    [Required]
    public DateOnly IssueDate { get; init; }

    public DateOnly? ExpiryDate { get; init; }

    [MaxLength(200)]
    public string? AccreditationId { get; init; }

    [MaxLength(500)]
    public string? OrganizationUrl { get; init; }
}
