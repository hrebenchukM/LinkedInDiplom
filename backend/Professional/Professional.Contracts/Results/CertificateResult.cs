using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

// Результат операции с сертификатом
public record CertificateResult
{
    public bool Succeeded { get; init; }

    public CertificateDto? Certificate { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
