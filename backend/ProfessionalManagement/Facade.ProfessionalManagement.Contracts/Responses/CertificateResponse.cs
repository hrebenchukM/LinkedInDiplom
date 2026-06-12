using Facade.ProfessionalManagement.Contracts.DTOs;

namespace Facade.ProfessionalManagement.Contracts.Responses;

// Ответ операций с сертификатом
public record CertificateResponse
{
    public bool Success { get; init; }

    public CertificateDto? Certificate { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
