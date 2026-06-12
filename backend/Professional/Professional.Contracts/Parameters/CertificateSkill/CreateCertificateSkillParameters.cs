namespace Professional.Contracts.Parameters.CertificateSkill;

// Параметры для добавления навыка к сертификату
public record CreateCertificateSkillParameters
{
    public string UserId { get; init; } = default!;

    public Guid CertificateId { get; init; }

    public Guid SkillId { get; init; }
}
