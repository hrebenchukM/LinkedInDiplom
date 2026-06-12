using Network.Contracts.DTOs;
using Network.Contracts.Parameters.BlockedUser;
using Network.Contracts.Results;

namespace Network.Contracts.Services;

// Интерфейс сервиса блокировок пользователей
public interface IBlockedUserService
{
    Task<BlockedUserResult> BlockAsync(BlockUserParameters parameters);

    Task<BlockedUserResult> UnblockAsync(UnblockUserParameters parameters);

    Task<IReadOnlyCollection<BlockedUserDto>> GetMyBlockedAsync(GetMyBlockedUsersParameters parameters);
}
