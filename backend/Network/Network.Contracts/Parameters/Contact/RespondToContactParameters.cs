namespace Network.Contracts.Parameters.Contact;

// Параметры принятия или отклонения запроса (UserId из JWT — receiver)
public record RespondToContactParameters
{
    public string UserId { get; init; } = default!;

    public Guid ContactId { get; init; }
}
