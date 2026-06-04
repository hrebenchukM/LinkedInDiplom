using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.CertificateSkill;
using Professional.Contracts.Results;

namespace Professional.Contracts.Services;

// Интерфейс сервиса связок сертификата с навыками
public interface ICertificateSkillService
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
