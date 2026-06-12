using Network.Client.Contracts.Resources;
using Network.Contracts.Parameters.Network;
using Network.Contracts.Results;
using Network.Contracts.Services;

namespace Network.Client.Resources;

public class NetworkUserGraphResource(INetworkUserGraphService networkUserGraphService) : INetworkUserGraphResource
{
    public Task<UserNetworkUserIdsResult> GetUserNetworkUserIdsAsync(
        GetUserNetworkUserIdsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        return networkUserGraphService.GetUserNetworkUserIdsAsync(parameters, cancellationToken);
    }
}
