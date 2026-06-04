namespace Professional.Contracts.Parameters.Certificate;

// Параметры для полного обновления сертификата
public record UpdateCertificateParameters
{
    public string UserId { get; init; } = default!;

    public Guid CertificateId { get; init; }

    public Guid? AcademyId { get; init; }

    public string Name { get; init; } = default!;

    public string? DownloadRef { get; init; }

    public DateOnly IssueDate { get; init; }

    public DateOnly? ExpiryDate { get; init; }

    public string? AccreditationId { get; init; }

    public string? OrganizationUrl { get; init; }
}
