namespace Network.Contracts.Parameters.Contact;

// Параметры отмены исходящего запроса (UserId из JWT — requester, status pending)
public record CancelContactRequestParameters
{
    public string UserId { get; init; } = default!;

    public Guid ContactId { get; init; }
}
