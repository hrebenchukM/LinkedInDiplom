namespace Professional.Contracts.Parameters.Certificate;

// Параметры для получения сертификатов пользователя
public record GetUserCertificatesParameters
{
    public string UserId { get; init; } = default!;
}
