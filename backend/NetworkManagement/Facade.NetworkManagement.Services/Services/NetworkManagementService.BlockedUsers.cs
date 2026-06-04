using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.BlockedUser;
using Facade.NetworkManagement.Contracts.Responses;
using Network.Contracts.Parameters.BlockedUser;

namespace Facade.NetworkManagement.Services.Services;

public partial class NetworkManagementService
{
    public async Task<BlockedUserResponse> BlockUserAsync(string userId, BlockUserRequest request)
    {
        var result = await _networkClient.BlockedUsers.BlockAsync(new BlockUserParameters
        {
            UserId = userId,
            BlockedUserId = request.BlockedUserId
        });

        return MapBlockedUserResult(result);
    }

    public async Task<BlockedUserResponse> UnblockUserAsync(string userId, string blockedUserId)
    {
        var result = await _networkClient.BlockedUsers.UnblockAsync(new UnblockUserParameters
        {
            UserId = userId,
            BlockedUserId = blockedUserId
        });

        return MapBlockedUserResult(result);
    }

    public async Task<IReadOnlyCollection<BlockedUserDto>> GetMyBlockedUsersAsync(string userId)
    {
        var blocks = await _networkClient.BlockedUsers.GetMyBlockedAsync(new GetMyBlockedUsersParameters
        {
            UserId = userId
        });

        return blocks.Select(MapBlockedUserToFacadeDto).ToList();
    }
}
