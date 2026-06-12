using Professional.Client.Contracts.Resources;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Certificate;
using Professional.Contracts.Results;
using Professional.Contracts.Services;

namespace Professional.Client.Resources;

// Реализация Resource для сертификатов.
// В модульном монолите она обращается напрямую к ICertificateService.
public class CertificateResource : ICertificateResource
{
    private readonly ICertificateService _certificateService;

    public CertificateResource(ICertificateService certificateService)
    {
        _certificateService = certificateService;
    }

    public Task<IReadOnlyCollection<CertificateDto>> GetUserCertificatesAsync(
        GetUserCertificatesParameters parameters)
    {
        return _certificateService.GetUserCertificatesAsync(parameters);
    }

    public Task<CertificateDto?> GetByIdAsync(GetCertificateByIdParameters parameters)
    {
        return _certificateService.GetByIdAsync(parameters);
    }

    public Task<CertificateResult> CreateAsync(CreateCertificateParameters parameters)
    {
        return _certificateService.CreateAsync(parameters);
    }

    public Task<CertificateResult> UpdateAsync(UpdateCertificateParameters parameters)
    {
        return _certificateService.UpdateAsync(parameters);
    }

    public Task<CertificateResult> PatchAsync(PatchCertificateParameters parameters)
    {
        return _certificateService.PatchAsync(parameters);
    }

    public Task<CertificateResult> DeleteAsync(DeleteCertificateParameters parameters)
    {
        return _certificateService.DeleteAsync(parameters);
    }
}
