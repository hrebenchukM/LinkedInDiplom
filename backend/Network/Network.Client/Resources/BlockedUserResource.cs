using Network.Client.Contracts.Resources;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.BlockedUser;
using Network.Contracts.Results;
using Network.Contracts.Services;

namespace Network.Client.Resources;

// Реализация Resource для блокировок.
// Делегирует вызовы в IBlockedUserService.
public class BlockedUserResource : IBlockedUserResource
{
    private readonly IBlockedUserService _blockedUserService;

    public BlockedUserResource(IBlockedUserService blockedUserService)
    {
        _blockedUserService = blockedUserService;
    }

    public Task<BlockedUserResult> BlockAsync(BlockUserParameters parameters)
    {
        return _blockedUserService.BlockAsync(parameters);
    }

    public Task<BlockedUserResult> UnblockAsync(UnblockUserParameters parameters)
    {
        return _blockedUserService.UnblockAsync(parameters);
    }

    public Task<IReadOnlyCollection<BlockedUserDto>> GetMyBlockedAsync(
        GetMyBlockedUsersParameters parameters)
    {
        return _blockedUserService.GetMyBlockedAsync(parameters);
    }
}
