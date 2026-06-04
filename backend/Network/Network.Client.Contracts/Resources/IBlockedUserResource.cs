using Network.Contracts.DTOs;
using Network.Contracts.Parameters.BlockedUser;
using Network.Contracts.Results;

namespace Network.Client.Contracts.Resources;

// Resource для работы с блокировками Network-модуля.
// Внутренняя точка доступа фасада к блокировкам.
public interface IBlockedUserResource
{
    Task<BlockedUserResult> BlockAsync(BlockUserParameters parameters);

    Task<BlockedUserResult> UnblockAsync(UnblockUserParameters parameters);

    Task<IReadOnlyCollection<BlockedUserDto>> GetMyBlockedAsync(GetMyBlockedUsersParameters parameters);
}
