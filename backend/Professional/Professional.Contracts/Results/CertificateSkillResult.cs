using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

// Результат операции со связкой сертификата и навыка
public record CertificateSkillResult
{
    public bool Succeeded { get; init; }

    public CertificateSkillDto? CertificateSkill { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
