namespace Network.Contracts.Parameters.Contact;

// Параметры удаления принятого контакта (UserId из JWT — участник связи)
public record RemoveContactParameters
{
    public string UserId { get; init; } = default!;

    public Guid ContactId { get; init; }
}
