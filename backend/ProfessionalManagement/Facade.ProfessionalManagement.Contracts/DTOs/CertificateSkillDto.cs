namespace Facade.ProfessionalManagement.Contracts.DTOs;

// DTO связки сертификата с навыком для frontend / Swagger
public record CertificateSkillDto
{
    public Guid Id { get; init; }

    public Guid CertificateId { get; init; }

    public Guid SkillId { get; init; }

    public DateTime CreatedAt { get; init; }
}
