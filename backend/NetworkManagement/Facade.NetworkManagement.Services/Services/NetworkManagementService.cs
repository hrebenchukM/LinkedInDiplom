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
public partial class NetworkManagementService : INetworkManagementService
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
