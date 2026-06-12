using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Certificate;
using Professional.Contracts.Results;

namespace Professional.Client.Contracts.Resources;

// Resource для работы с сертификатами.
// Это внутренняя точка доступа фасада к Professional-модулю.
public interface ICertificateResource
{
    Task<IReadOnlyCollection<CertificateDto>> GetUserCertificatesAsync(
        GetUserCertificatesParameters parameters);

    Task<CertificateDto?> GetByIdAsync(
        GetCertificateByIdParameters parameters);

    Task<CertificateResult> CreateAsync(
        CreateCertificateParameters parameters);

    Task<CertificateResult> UpdateAsync(
        UpdateCertificateParameters parameters);

    Task<CertificateResult> PatchAsync(
        PatchCertificateParameters parameters);

    Task<CertificateResult> DeleteAsync(
        DeleteCertificateParameters parameters);
}
