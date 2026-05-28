using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Certificate;

// Запрос на частичное обновление сертификата.
// Если поле null — значит его не меняем.
public record PatchCertificateRequest
{
    public Guid? AcademyId { get; init; }

    [MaxLength(200)]
    public string? Name { get; init; }

    [MaxLength(500)]
    public string? DownloadRef { get; init; }

    public DateOnly? IssueDate { get; init; }

    public DateOnly? ExpiryDate { get; init; }

    [MaxLength(200)]
    public string? AccreditationId { get; init; }

    [Url]
    [MaxLength(500)]
    public string? OrganizationUrl { get; init; }
}
