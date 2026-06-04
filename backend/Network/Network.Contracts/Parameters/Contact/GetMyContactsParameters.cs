namespace Network.Contracts.Parameters.Contact;

// Параметры получения контактов текущего пользователя (UserId из JWT)
public record GetMyContactsParameters
{
    public string UserId { get; init; } = default!;

    // pending, accepted, rejected, cancelled; null — все статусы
    public string? Status { get; init; }
}
