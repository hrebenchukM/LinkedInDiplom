namespace Professional.Contracts.Parameters.Certificate;

// Параметры для получения одного сертификата
public record GetCertificateByIdParameters
{
    public string UserId { get; init; } = default!;

    public Guid CertificateId { get; init; }
}
