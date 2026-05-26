namespace Network.Contracts.Parameters.Contact;

// Параметры получения контакта по Id (UserId из JWT — участник связи)
public record GetContactByIdParameters
{
    public string UserId { get; init; } = default!;

    public Guid ContactId { get; init; }
}
