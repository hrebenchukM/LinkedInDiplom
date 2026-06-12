using Network.Contracts.Parameters.Network;
using Network.Contracts.Results;

namespace Network.Client.Contracts.Resources;

public interface INetworkUserGraphResource
{
    Task<UserNetworkUserIdsResult> GetUserNetworkUserIdsAsync(
        GetUserNetworkUserIdsParameters parameters,
        CancellationToken cancellationToken = default);
}
