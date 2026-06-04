namespace Professional.Contracts.Parameters.Certificate;

// Параметры для удаления сертификата
public record DeleteCertificateParameters
{
    public string UserId { get; init; } = default!;

    public Guid CertificateId { get; init; }
}
