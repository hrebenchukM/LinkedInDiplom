namespace Professional.Contracts.Parameters.CertificateSkill;

// Параметры для удаления связки сертификата и навыка
public record DeleteCertificateSkillParameters
{
    public string UserId { get; init; } = default!;

    public Guid CertificateId { get; init; }

    public Guid CertificateSkillId { get; init; }
}
