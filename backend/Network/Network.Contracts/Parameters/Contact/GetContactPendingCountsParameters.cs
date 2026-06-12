namespace Network.Contracts.Parameters.Contact;

public record GetContactPendingCountsParameters
{
    public string UserId { get; init; } = default!;
}
