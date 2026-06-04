namespace Network.Contracts.Parameters.Contact;

// Параметры отправки запроса на контакт (RequesterId из JWT)
public record SendContactRequestParameters
{
    public string RequesterId { get; init; } = default!;

    public string ReceiverId { get; init; } = default!;
}
