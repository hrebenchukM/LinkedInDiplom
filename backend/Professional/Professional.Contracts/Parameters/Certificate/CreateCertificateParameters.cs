namespace Professional.Contracts.Parameters.Certificate;

// Параметры для создания сертификата
public record CreateCertificateParameters
{
    public string UserId { get; init; } = default!;

    public Guid? AcademyId { get; init; }

    public string Name { get; init; } = default!;

    public string? DownloadRef { get; init; }

    public DateOnly IssueDate { get; init; }

    public DateOnly? ExpiryDate { get; init; }

    public string? AccreditationId { get; init; }

    public string? OrganizationUrl { get; init; }
}
