namespace Facade.ProfessionalManagement.Contracts.Requests.Certificate;

// Запрос на частичное обновление сертификата.
// Если поле null — значит его не меняем.
public record PatchCertificateRequest
{
    public Guid? AcademyId { get; init; }

    public string? Name { get; init; }

    public string? DownloadRef { get; init; }

    public DateOnly? IssueDate { get; init; }

    public DateOnly? ExpiryDate { get; init; }

    public string? AccreditationId { get; init; }

    public string? OrganizationUrl { get; init; }
}
