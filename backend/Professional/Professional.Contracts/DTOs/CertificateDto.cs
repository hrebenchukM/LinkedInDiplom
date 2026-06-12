namespace Professional.Contracts.DTOs;

// DTO сертификата пользователя
public record CertificateDto
{
    public Guid Id { get; init; }

    // Id пользователя из Identity
    public string UserId { get; init; } = default!;

    public Guid? AcademyId { get; init; }

    public string Name { get; init; } = default!;

    public string? DownloadRef { get; init; }

    public DateOnly IssueDate { get; init; }

    public DateOnly? ExpiryDate { get; init; }

    public string? AccreditationId { get; init; }

    public string? OrganizationUrl { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
