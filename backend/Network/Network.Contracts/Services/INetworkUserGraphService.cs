using Network.Contracts.Parameters.Network;
using Network.Contracts.Results;

namespace Network.Contracts.Services;

public interface INetworkUserGraphService
{
    Task<UserNetworkUserIdsResult> GetUserNetworkUserIdsAsync(
        GetUserNetworkUserIdsParameters parameters,
        CancellationToken cancellationToken = default);
}
