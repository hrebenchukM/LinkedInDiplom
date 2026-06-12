namespace Professional.Contracts.Parameters.Certificate;

// Параметры для частичного обновления сертификата.
// Если поле null — значит его не меняем.
public record PatchCertificateParameters
{
    public string UserId { get; init; } = default!;

    public Guid CertificateId { get; init; }

    public Guid? AcademyId { get; init; }

    public string? Name { get; init; }

    public string? DownloadRef { get; init; }

    public DateOnly? IssueDate { get; init; }

    public DateOnly? ExpiryDate { get; init; }

    public string? AccreditationId { get; init; }

    public string? OrganizationUrl { get; init; }
}
