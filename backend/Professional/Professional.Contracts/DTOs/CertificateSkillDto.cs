namespace Professional.Contracts.DTOs;

// DTO связки сертификата с навыком
public record CertificateSkillDto
{
    public Guid Id { get; init; }

    public Guid CertificateId { get; init; }

    public Guid SkillId { get; init; }

    public DateTime CreatedAt { get; init; }
}
