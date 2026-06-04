namespace Professional.Contracts.Parameters.CertificateSkill;

// Параметры для получения одной связки сертификата и навыка
public record GetCertificateSkillByIdParameters
{
    public string UserId { get; init; } = default!;

    public Guid CertificateId { get; init; }

    public Guid CertificateSkillId { get; init; }
}
