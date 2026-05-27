using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.BlockedUser;
using Facade.NetworkManagement.Contracts.Requests.Contact;
using Facade.NetworkManagement.Contracts.Requests.Follow;
using Facade.NetworkManagement.Contracts.Requests.Group;
using Facade.NetworkManagement.Contracts.Requests.Page;
using Facade.NetworkManagement.Contracts.Requests.PageAdmin;
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

    Task<UserGroupResponse> CreateUserGroupAsync(string userId, CreateUserGroupRequest request);

    Task<IReadOnlyCollection<UserGroupDto>> GetMyUserGroupsAsync(string userId);

    Task<UserGroupDto?> GetMyUserGroupByIdAsync(string userId, Guid groupId);

    Task<UserGroupResponse> UpdateUserGroupAsync(string userId, Guid groupId, UpdateUserGroupRequest request);

    Task<UserGroupResponse> DeleteUserGroupAsync(string userId, Guid groupId);

    Task<GroupMemberResponse> JoinGroupAsync(string userId, Guid groupId);

    Task<GroupMemberResponse> LeaveGroupAsync(string userId, Guid groupId);

    Task<IReadOnlyCollection<GroupMemberDto>> GetGroupMembersAsync(string userId, Guid groupId);

    Task<GroupPostResponse> AttachPostToGroupAsync(string userId, Guid groupId, Guid postId);

    Task<GroupPostResponse> DetachPostFromGroupAsync(string userId, Guid groupId, Guid postId);

    Task<IReadOnlyCollection<GroupPostDto>?> GetGroupPostsAsync(string userId, Guid groupId);

    Task<PageResponse> CreatePageAsync(string userId, CreatePageRequest request);

    Task<IReadOnlyCollection<PageDto>> GetMyPagesAsync(string userId);

    Task<PageDto?> GetMyPageByIdAsync(string userId, Guid pageId);

    Task<PageResponse> UpdatePageAsync(string userId, Guid pageId, UpdatePageRequest request);

    Task<PageResponse> DeletePageAsync(string userId, Guid pageId);

    Task<PageAdminResponse> AddPageAdminAsync(string userId, Guid pageId, AddPageAdminRequest request);

    Task<PageAdminResponse> RemovePageAdminAsync(string userId, Guid pageId, string adminUserId);

    Task<IReadOnlyCollection<PageAdminDto>> GetPageAdminsAsync(string userId, Guid pageId);

    Task<PageFollowerResponse> FollowPageAsync(string userId, Guid pageId);

    Task<PageFollowerResponse> UnfollowPageAsync(string userId, Guid pageId);

    Task<IReadOnlyCollection<PageDto>> GetMyFollowedPagesAsync(string userId);

    Task<IReadOnlyCollection<PageFollowerDto>> GetPageFollowersAsync(string userId, Guid pageId);
}
