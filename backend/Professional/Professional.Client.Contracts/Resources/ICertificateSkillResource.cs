using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.CertificateSkill;
using Professional.Contracts.Results;

namespace Professional.Client.Contracts.Resources;

// Resource для работы со связками сертификата и навыков.
// Это внутренняя точка доступа фасада к Professional-модулю.
public interface ICertificateSkillResource
{
    Task<IReadOnlyCollection<CertificateSkillDto>> GetCertificateSkillsAsync(
        GetCertificateSkillsParameters parameters);

    Task<CertificateSkillDto?> GetByIdAsync(
        GetCertificateSkillByIdParameters parameters);

    Task<CertificateSkillResult> CreateAsync(
        CreateCertificateSkillParameters parameters);

    Task<CertificateSkillResult> DeleteAsync(
        DeleteCertificateSkillParameters parameters);
}
