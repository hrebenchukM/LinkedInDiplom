using Facade.ProfessionalManagement.Contracts.DTOs;

namespace Facade.ProfessionalManagement.Contracts.Responses;

// Ответ операций со связкой сертификата и навыка
public record CertificateSkillResponse
{
    public bool Success { get; init; }

    public CertificateSkillDto? CertificateSkill { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
