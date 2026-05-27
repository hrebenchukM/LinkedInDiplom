using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.BlockedUser;
using Facade.NetworkManagement.Contracts.Requests.Contact;
using Facade.NetworkManagement.Contracts.Requests.Follow;
using Facade.NetworkManagement.Contracts.Requests.Group;
using Facade.NetworkManagement.Contracts.Requests.Page;
using Facade.NetworkManagement.Contracts.Requests.PageAdmin;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Content.Client.Contracts;
using Content.Contracts.Parameters.Post;
using Network.Client.Contracts;
using Network.Contracts.Parameters.BlockedUser;
using Network.Contracts.Parameters.Contact;
using Network.Contracts.Parameters.Follow;
using Network.Contracts.Parameters.GroupPost;
using Network.Contracts.Parameters.GroupMember;
using Network.Contracts.Parameters.Page;
using Network.Contracts.Parameters.PageAdmin;
using Network.Contracts.Parameters.PageFollower;
using Network.Contracts.Parameters.UserGroup;
using Network.Contracts.Results;
using NetworkContactDto = Network.Contracts.DTOs.ContactDto;
using NetworkFollowDto = Network.Contracts.DTOs.FollowDto;
using NetworkBlockedUserDto = Network.Contracts.DTOs.BlockedUserDto;
using NetworkUserGroupDto = Network.Contracts.DTOs.UserGroupDto;
using NetworkGroupMemberDto = Network.Contracts.DTOs.GroupMemberDto;
using NetworkPageDto = Network.Contracts.DTOs.PageDto;
using NetworkPageAdminDto = Network.Contracts.DTOs.PageAdminDto;
using NetworkPageFollowerDto = Network.Contracts.DTOs.PageFollowerDto;
using NetworkGroupPostDto = Network.Contracts.DTOs.GroupPostDto;

namespace Facade.NetworkManagement.Services.Services;

// Фасадный сервис для Network-модуля.
// Обращается к Network через INetworkClient.
public class NetworkManagementService : INetworkManagementService
{
    private const string StatusPending = "pending";
    private const string StatusAccepted = "accepted";

    private readonly INetworkClient _networkClient;
    private readonly IContentClient _contentClient;

    public NetworkManagementService(INetworkClient networkClient, IContentClient contentClient)
    {
        _networkClient = networkClient;
        _contentClient = contentClient;
    }

    public async Task<ContactResponse> SendContactRequestAsync(string userId, SendContactRequest request)
    {
        var result = await _networkClient.Contacts.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = userId,
            ReceiverId = request.ReceiverId
        });

        return MapContactResult(result);
    }

    public async Task<IReadOnlyCollection<ContactDto>> GetMyContactsAsync(string userId)
    {
        var contacts = await _networkClient.Contacts.GetMyContactsAsync(new GetMyContactsParameters
        {
            UserId = userId
        });

        return contacts.Select(MapContactToFacadeDto).ToList();
    }

    public async Task<ContactDto?> GetMyContactByIdAsync(string userId, Guid contactId)
    {
        var contact = await _networkClient.Contacts.GetByIdAsync(new GetContactByIdParameters
        {
            UserId = userId,
            ContactId = contactId
        });

        return contact == null ? null : MapContactToFacadeDto(contact);
    }

    public async Task<ContactResponse> AcceptContactAsync(string userId, Guid contactId)
    {
        var result = await _networkClient.Contacts.AcceptAsync(new RespondToContactParameters
        {
            UserId = userId,
            ContactId = contactId
        });

        return MapContactResult(result);
    }

    public async Task<ContactResponse> RejectContactAsync(string userId, Guid contactId)
    {
        var result = await _networkClient.Contacts.RejectAsync(new RespondToContactParameters
        {
            UserId = userId,
            ContactId = contactId
        });

        return MapContactResult(result);
    }

    public async Task<ContactResponse> DeleteMyContactAsync(string userId, Guid contactId)
    {
        var contact = await _networkClient.Contacts.GetByIdAsync(new GetContactByIdParameters
        {
            UserId = userId,
            ContactId = contactId
        });

        if (contact == null)
        {
            return new ContactResponse
            {
                Success = false,
                Errors = new[] { "Contact not found." }
            };
        }

        ContactResult result;

        if (contact.Status == StatusPending)
        {
            result = await _networkClient.Contacts.CancelAsync(new CancelContactRequestParameters
            {
                UserId = userId,
                ContactId = contactId
            });
        }
        else if (contact.Status == StatusAccepted)
        {
            result = await _networkClient.Contacts.RemoveAsync(new RemoveContactParameters
            {
                UserId = userId,
                ContactId = contactId
            });
        }
        else
        {
            return new ContactResponse
            {
                Success = false,
                Errors = new[] { "Contact not found." }
            };
        }

        return MapContactResult(result);
    }

    public async Task<FollowResponse> FollowUserAsync(string userId, FollowUserRequest request)
    {
        var result = await _networkClient.Follows.FollowAsync(new FollowUserParameters
        {
            FollowerId = userId,
            FollowingId = request.FollowingId
        });

        return MapFollowResult(result);
    }

    public async Task<FollowResponse> UnfollowUserAsync(string userId, string followingId)
    {
        var result = await _networkClient.Follows.UnfollowAsync(new UnfollowUserParameters
        {
            FollowerId = userId,
            FollowingId = followingId
        });

        return MapFollowResult(result);
    }

    public async Task<IReadOnlyCollection<FollowDto>> GetMyFollowingAsync(string userId)
    {
        var follows = await _networkClient.Follows.GetMyFollowingAsync(new GetMyFollowingParameters
        {
            UserId = userId
        });

        return follows.Select(MapFollowToFacadeDto).ToList();
    }

    public async Task<IReadOnlyCollection<FollowDto>> GetMyFollowersAsync(string userId)
    {
        var follows = await _networkClient.Follows.GetMyFollowersAsync(new GetMyFollowersParameters
        {
            UserId = userId
        });

        return follows.Select(MapFollowToFacadeDto).ToList();
    }

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

    public async Task<UserGroupResponse> CreateUserGroupAsync(string userId, CreateUserGroupRequest request)
    {
        var result = await _networkClient.UserGroups.CreateAsync(new CreateUserGroupParameters
        {
            OwnerId = userId,
            Name = request.Name,
            Description = request.Description,
            AvatarUrl = request.AvatarUrl
        });

        return MapUserGroupResult(result);
    }

    public async Task<IReadOnlyCollection<UserGroupDto>> GetMyUserGroupsAsync(string userId)
    {
        var groups = await _networkClient.UserGroups.GetMyGroupsAsync(new GetMyUserGroupsParameters
        {
            UserId = userId
        });

        return groups.Select(MapUserGroupToFacadeDto).ToList();
    }

    public async Task<UserGroupDto?> GetMyUserGroupByIdAsync(string userId, Guid groupId)
    {
        var group = await _networkClient.UserGroups.GetByIdAsync(new GetUserGroupByIdParameters
        {
            UserId = userId,
            GroupId = groupId
        });

        return group == null ? null : MapUserGroupToFacadeDto(group);
    }

    public async Task<UserGroupResponse> UpdateUserGroupAsync(
        string userId,
        Guid groupId,
        UpdateUserGroupRequest request)
    {
        var result = await _networkClient.UserGroups.UpdateAsync(new UpdateUserGroupParameters
        {
            OwnerId = userId,
            GroupId = groupId,
            Name = request.Name,
            Description = request.Description,
            AvatarUrl = request.AvatarUrl
        });

        return MapUserGroupResult(result);
    }

    public async Task<UserGroupResponse> DeleteUserGroupAsync(string userId, Guid groupId)
    {
        var result = await _networkClient.UserGroups.DeleteAsync(new DeleteUserGroupParameters
        {
            OwnerId = userId,
            GroupId = groupId
        });

        return MapUserGroupResult(result);
    }

    public async Task<GroupMemberResponse> JoinGroupAsync(string userId, Guid groupId)
    {
        var result = await _networkClient.GroupMembers.JoinAsync(new JoinGroupParameters
        {
            UserId = userId,
            GroupId = groupId
        });

        return MapGroupMemberResult(result);
    }

    public async Task<GroupMemberResponse> LeaveGroupAsync(string userId, Guid groupId)
    {
        var result = await _networkClient.GroupMembers.LeaveAsync(new LeaveGroupParameters
        {
            UserId = userId,
            GroupId = groupId
        });

        return MapGroupMemberResult(result);
    }

    public async Task<IReadOnlyCollection<GroupMemberDto>> GetGroupMembersAsync(string userId, Guid groupId)
    {
        var members = await _networkClient.GroupMembers.GetGroupMembersAsync(new GetGroupMembersParameters
        {
            UserId = userId,
            GroupId = groupId
        });

        return members.Select(MapGroupMemberToFacadeDto).ToList();
    }

    public async Task<GroupPostResponse> AttachPostToGroupAsync(string userId, Guid groupId, Guid postId)
    {
        var post = await _contentClient.Posts.GetByIdAsync(new GetPostByIdParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        if (post == null || post.UserId != userId)
        {
            return new GroupPostResponse
            {
                Success = false,
                Errors = new[] { "Post not found." }
            };
        }

        var result = await _networkClient.GroupPosts.AttachPostToGroupAsync(new AttachGroupPostParameters
        {
            UserId = userId,
            GroupId = groupId,
            PostId = postId
        });

        return MapGroupPostResult(result);
    }

    public async Task<GroupPostResponse> DetachPostFromGroupAsync(string userId, Guid groupId, Guid postId)
    {
        var post = await _contentClient.Posts.GetByIdAsync(new GetPostByIdParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        if (post == null || post.UserId != userId)
        {
            return new GroupPostResponse
            {
                Success = false,
                Errors = new[] { "Post not found." }
            };
        }

        var result = await _networkClient.GroupPosts.DetachPostFromGroupAsync(new DetachGroupPostParameters
        {
            UserId = userId,
            GroupId = groupId,
            PostId = postId
        });

        return MapGroupPostResult(result);
    }

    public async Task<IReadOnlyCollection<GroupPostDto>?> GetGroupPostsAsync(string userId, Guid groupId)
    {
        var group = await _networkClient.UserGroups.GetByIdAsync(new GetUserGroupByIdParameters
        {
            UserId = userId,
            GroupId = groupId
        });

        if (group == null)
        {
            return null;
        }

        var groupPosts = await _networkClient.GroupPosts.GetGroupPostsAsync(new GetGroupPostsParameters
        {
            UserId = userId,
            GroupId = groupId
        });

        return groupPosts.Select(MapGroupPostToFacadeDto).ToList();
    }

    public async Task<PageResponse> CreatePageAsync(string userId, CreatePageRequest request)
    {
        var result = await _networkClient.Pages.CreateAsync(new CreatePageParameters
        {
            OwnerId = userId,
            Name = request.Name,
            Description = request.Description,
            LogoUrl = request.LogoUrl
        });

        return MapPageResult(result);
    }

    public async Task<IReadOnlyCollection<PageDto>> GetMyPagesAsync(string userId)
    {
        var pages = await _networkClient.Pages.GetMyPagesAsync(new GetMyPagesParameters
        {
            OwnerId = userId
        });

        return pages.Select(MapPageToFacadeDto).ToList();
    }

    public async Task<PageDto?> GetMyPageByIdAsync(string userId, Guid pageId)
    {
        var page = await _networkClient.Pages.GetByIdAsync(new GetPageByIdParameters
        {
            UserId = userId,
            PageId = pageId
        });

        return page == null ? null : MapPageToFacadeDto(page);
    }

    public async Task<PageResponse> UpdatePageAsync(string userId, Guid pageId, UpdatePageRequest request)
    {
        var result = await _networkClient.Pages.UpdateAsync(new UpdatePageParameters
        {
            OwnerId = userId,
            PageId = pageId,
            Name = request.Name,
            Description = request.Description,
            LogoUrl = request.LogoUrl
        });

        return MapPageResult(result);
    }

    public async Task<PageResponse> DeletePageAsync(string userId, Guid pageId)
    {
        var result = await _networkClient.Pages.DeleteAsync(new DeletePageParameters
        {
            OwnerId = userId,
            PageId = pageId
        });

        return MapPageResult(result);
    }

    public async Task<PageAdminResponse> AddPageAdminAsync(
        string userId,
        Guid pageId,
        AddPageAdminRequest request)
    {
        var result = await _networkClient.PageAdmins.AddAdminAsync(new AddPageAdminParameters
        {
            OwnerId = userId,
            PageId = pageId,
            UserId = request.UserId
        });

        return MapPageAdminResult(result);
    }

    public async Task<PageAdminResponse> RemovePageAdminAsync(
        string userId,
        Guid pageId,
        string adminUserId)
    {
        var result = await _networkClient.PageAdmins.RemoveAdminAsync(new RemovePageAdminParameters
        {
            OwnerId = userId,
            PageId = pageId,
            UserId = adminUserId
        });

        return MapPageAdminResult(result);
    }

    public async Task<IReadOnlyCollection<PageAdminDto>> GetPageAdminsAsync(string userId, Guid pageId)
    {
        var admins = await _networkClient.PageAdmins.GetPageAdminsAsync(new GetPageAdminsParameters
        {
            UserId = userId,
            PageId = pageId
        });

        return admins.Select(MapPageAdminToFacadeDto).ToList();
    }

    public async Task<PageFollowerResponse> FollowPageAsync(string userId, Guid pageId)
    {
        var result = await _networkClient.PageFollowers.FollowPageAsync(new FollowPageParameters
        {
            UserId = userId,
            PageId = pageId
        });

        return MapPageFollowerResult(result);
    }

    public async Task<PageFollowerResponse> UnfollowPageAsync(string userId, Guid pageId)
    {
        var result = await _networkClient.PageFollowers.UnfollowPageAsync(new UnfollowPageParameters
        {
            UserId = userId,
            PageId = pageId
        });

        return MapPageFollowerResult(result);
    }

    public async Task<IReadOnlyCollection<PageDto>> GetMyFollowedPagesAsync(string userId)
    {
        var pages = await _networkClient.PageFollowers.GetMyFollowedPagesAsync(
            new GetMyFollowedPagesParameters
            {
                UserId = userId
            });

        return pages.Select(MapPageToFacadeDto).ToList();
    }

    public async Task<IReadOnlyCollection<PageFollowerDto>> GetPageFollowersAsync(string userId, Guid pageId)
    {
        var followers = await _networkClient.PageFollowers.GetPageFollowersAsync(new GetPageFollowersParameters
        {
            UserId = userId,
            PageId = pageId
        });

        return followers.Select(MapPageFollowerToFacadeDto).ToList();
    }

    private static ContactResponse MapContactResult(ContactResult result)
    {
        return new ContactResponse
        {
            Success = result.Succeeded,
            Contact = result.Contact == null ? null : MapContactToFacadeDto(result.Contact),
            Errors = result.Errors
        };
    }

    private static FollowResponse MapFollowResult(FollowResult result)
    {
        return new FollowResponse
        {
            Success = result.Succeeded,
            Follow = result.Follow == null ? null : MapFollowToFacadeDto(result.Follow),
            Errors = result.Errors
        };
    }

    private static BlockedUserResponse MapBlockedUserResult(BlockedUserResult result)
    {
        return new BlockedUserResponse
        {
            Success = result.Succeeded,
            BlockedUser = result.BlockedUser == null ? null : MapBlockedUserToFacadeDto(result.BlockedUser),
            Errors = result.Errors
        };
    }

    private static UserGroupResponse MapUserGroupResult(UserGroupResult result)
    {
        return new UserGroupResponse
        {
            Success = result.Succeeded,
            UserGroup = result.UserGroup == null ? null : MapUserGroupToFacadeDto(result.UserGroup),
            Errors = result.Errors
        };
    }

    private static GroupMemberResponse MapGroupMemberResult(GroupMemberResult result)
    {
        return new GroupMemberResponse
        {
            Success = result.Succeeded,
            GroupMember = result.GroupMember == null ? null : MapGroupMemberToFacadeDto(result.GroupMember),
            Errors = result.Errors
        };
    }

    private static GroupPostResponse MapGroupPostResult(GroupPostResult result)
    {
        return new GroupPostResponse
        {
            Success = result.Succeeded,
            GroupPost = result.GroupPost == null ? null : MapGroupPostToFacadeDto(result.GroupPost),
            Errors = result.Errors
        };
    }

    private static PageResponse MapPageResult(PageResult result)
    {
        return new PageResponse
        {
            Success = result.Succeeded,
            Page = result.Page == null ? null : MapPageToFacadeDto(result.Page),
            Errors = result.Errors
        };
    }

    private static PageAdminResponse MapPageAdminResult(PageAdminResult result)
    {
        return new PageAdminResponse
        {
            Success = result.Succeeded,
            PageAdmin = result.PageAdmin == null ? null : MapPageAdminToFacadeDto(result.PageAdmin),
            Errors = result.Errors
        };
    }

    private static PageFollowerResponse MapPageFollowerResult(PageFollowerResult result)
    {
        return new PageFollowerResponse
        {
            Success = result.Succeeded,
            PageFollower = result.PageFollower == null
                ? null
                : MapPageFollowerToFacadeDto(result.PageFollower),
            Errors = result.Errors
        };
    }

    private static ContactDto MapContactToFacadeDto(NetworkContactDto contact)
    {
        return new ContactDto
        {
            Id = contact.Id,
            RequesterId = contact.RequesterId,
            ReceiverId = contact.ReceiverId,
            Status = contact.Status,
            RequestedAt = contact.RequestedAt,
            RespondedAt = contact.RespondedAt,
            StatusChangedAt = contact.StatusChangedAt
        };
    }

    private static FollowDto MapFollowToFacadeDto(NetworkFollowDto follow)
    {
        return new FollowDto
        {
            Id = follow.Id,
            FollowerId = follow.FollowerId,
            FollowingId = follow.FollowingId,
            FollowedAt = follow.FollowedAt,
            UnfollowedAt = follow.UnfollowedAt
        };
    }

    private static BlockedUserDto MapBlockedUserToFacadeDto(NetworkBlockedUserDto blockedUser)
    {
        return new BlockedUserDto
        {
            Id = blockedUser.Id,
            UserId = blockedUser.UserId,
            BlockedUserId = blockedUser.BlockedUserId,
            BlockedAt = blockedUser.BlockedAt,
            UnblockedAt = blockedUser.UnblockedAt
        };
    }

    private static UserGroupDto MapUserGroupToFacadeDto(NetworkUserGroupDto userGroup)
    {
        return new UserGroupDto
        {
            Id = userGroup.Id,
            OwnerId = userGroup.OwnerId,
            Name = userGroup.Name,
            Description = userGroup.Description,
            AvatarUrl = userGroup.AvatarUrl,
            CreatedAt = userGroup.CreatedAt,
            UpdatedAt = userGroup.UpdatedAt
        };
    }

    private static GroupMemberDto MapGroupMemberToFacadeDto(NetworkGroupMemberDto groupMember)
    {
        return new GroupMemberDto
        {
            Id = groupMember.Id,
            GroupId = groupMember.GroupId,
            UserId = groupMember.UserId,
            Role = groupMember.Role,
            CreatedAt = groupMember.CreatedAt,
            UpdatedAt = groupMember.UpdatedAt
        };
    }

    private static GroupPostDto MapGroupPostToFacadeDto(NetworkGroupPostDto groupPost)
    {
        return new GroupPostDto
        {
            Id = groupPost.Id,
            GroupId = groupPost.GroupId,
            PostId = groupPost.PostId,
            CreatedAt = groupPost.CreatedAt
        };
    }

    private static PageDto MapPageToFacadeDto(NetworkPageDto page)
    {
        return new PageDto
        {
            Id = page.Id,
            OwnerId = page.OwnerId,
            Name = page.Name,
            Description = page.Description,
            LogoUrl = page.LogoUrl,
            CreatedAt = page.CreatedAt,
            UpdatedAt = page.UpdatedAt
        };
    }

    private static PageAdminDto MapPageAdminToFacadeDto(NetworkPageAdminDto pageAdmin)
    {
        return new PageAdminDto
        {
            Id = pageAdmin.Id,
            PageId = pageAdmin.PageId,
            UserId = pageAdmin.UserId,
            Role = pageAdmin.Role,
            AssignedAt = pageAdmin.AssignedAt,
            RevokedAt = pageAdmin.RevokedAt
        };
    }

    private static PageFollowerDto MapPageFollowerToFacadeDto(NetworkPageFollowerDto pageFollower)
    {
        return new PageFollowerDto
        {
            Id = pageFollower.Id,
            PageId = pageFollower.PageId,
            UserId = pageFollower.UserId,
            FollowedAt = pageFollower.FollowedAt,
            UnfollowedAt = pageFollower.UnfollowedAt
        };
    }
}
