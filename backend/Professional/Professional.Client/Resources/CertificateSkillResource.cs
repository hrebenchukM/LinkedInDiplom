using Professional.Client.Contracts.Resources;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.CertificateSkill;
using Professional.Contracts.Results;
using Professional.Contracts.Services;

namespace Professional.Client.Resources;

// Реализация Resource для связок сертификата с навыками.
// В модульном монолите она обращается напрямую к ICertificateSkillService.
public class CertificateSkillResource : ICertificateSkillResource
{
    private readonly ICertificateSkillService _certificateSkillService;

    public CertificateSkillResource(ICertificateSkillService certificateSkillService)
    {
        _certificateSkillService = certificateSkillService;
    }

    public Task<IReadOnlyCollection<CertificateSkillDto>> GetCertificateSkillsAsync(
        GetCertificateSkillsParameters parameters)
    {
        return _certificateSkillService.GetCertificateSkillsAsync(parameters);
    }

    public Task<CertificateSkillDto?> GetByIdAsync(GetCertificateSkillByIdParameters parameters)
    {
        return _certificateSkillService.GetByIdAsync(parameters);
    }

    public Task<CertificateSkillResult> CreateAsync(CreateCertificateSkillParameters parameters)
    {
        return _certificateSkillService.CreateAsync(parameters);
    }

    public Task<CertificateSkillResult> DeleteAsync(DeleteCertificateSkillParameters parameters)
    {
        return _certificateSkillService.DeleteAsync(parameters);
    }
}
