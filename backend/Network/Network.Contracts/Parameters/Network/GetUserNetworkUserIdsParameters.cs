namespace Network.Contracts.Parameters.Network;

public record GetUserNetworkUserIdsParameters
{
    public string UserId { get; init; } = default!;
}
