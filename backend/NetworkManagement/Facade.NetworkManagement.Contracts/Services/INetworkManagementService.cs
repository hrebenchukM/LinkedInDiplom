using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.BlockedUser;
using Facade.NetworkManagement.Contracts.Requests.Contact;
using Facade.NetworkManagement.Contracts.Requests.Follow;
using Facade.NetworkManagement.Contracts.Responses;

namespace Facade.NetworkManagement.Contracts.Services;

// Фасадный сервис для Network-модуля
public interface INetworkManagementService
{
    Task<ContactResponse> SendContactRequestAsync(string userId, SendContactRequest request);

    Task<IReadOnlyCollection<ContactDto>> GetMyContactsAsync(string userId);

    Task<ContactDto?> GetMyContactByIdAsync(string userId, Guid contactId);

    Task<ContactResponse> AcceptContactAsync(string userId, Guid contactId);

    Task<ContactResponse> RejectContactAsync(string userId, Guid contactId);

    Task<ContactResponse> DeleteMyContactAsync(string userId, Guid contactId);

    Task<FollowResponse> FollowUserAsync(string userId, FollowUserRequest request);

    Task<FollowResponse> UnfollowUserAsync(string userId, string followingId);

    Task<IReadOnlyCollection<FollowDto>> GetMyFollowingAsync(string userId);

    Task<IReadOnlyCollection<FollowDto>> GetMyFollowersAsync(string userId);

    Task<BlockedUserResponse> BlockUserAsync(string userId, BlockUserRequest request);

    Task<BlockedUserResponse> UnblockUserAsync(string userId, string blockedUserId);

    Task<IReadOnlyCollection<BlockedUserDto>> GetMyBlockedUsersAsync(string userId);
}
