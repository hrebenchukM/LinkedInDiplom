namespace Professional.Contracts.Parameters.CertificateSkill;

// Параметры для получения навыков сертификата
public record GetCertificateSkillsParameters
{
    public string UserId { get; init; } = default!;

    public Guid CertificateId { get; init; }
}
