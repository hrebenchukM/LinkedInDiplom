namespace Network.Contracts.Results;

public record UserNetworkUserIdsResult
{
    public IReadOnlyCollection<string> UserIds { get; init; } = Array.Empty<string>();
}
