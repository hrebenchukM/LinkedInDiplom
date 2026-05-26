using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.BlockedUser;
using Facade.NetworkManagement.Contracts.Requests.Contact;
using Facade.NetworkManagement.Contracts.Requests.Follow;
using Facade.NetworkManagement.Contracts.Requests.Group;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Network.Client.Contracts;
using Network.Contracts.Parameters.BlockedUser;
using Network.Contracts.Parameters.Contact;
using Network.Contracts.Parameters.Follow;
using Network.Contracts.Parameters.GroupMember;
using Network.Contracts.Parameters.UserGroup;
using Network.Contracts.Results;
using NetworkContactDto = Network.Contracts.DTOs.ContactDto;
using NetworkFollowDto = Network.Contracts.DTOs.FollowDto;
using NetworkBlockedUserDto = Network.Contracts.DTOs.BlockedUserDto;
using NetworkUserGroupDto = Network.Contracts.DTOs.UserGroupDto;
using NetworkGroupMemberDto = Network.Contracts.DTOs.GroupMemberDto;

namespace Facade.NetworkManagement.Services.Services;

// Фасадный сервис для Network-модуля.
// Обращается к Network через INetworkClient.
public class NetworkManagementService : INetworkManagementService
{
    private const string StatusPending = "pending";
    private const string StatusAccepted = "accepted";

    private readonly INetworkClient _networkClient;

    public NetworkManagementService(INetworkClient networkClient)
    {
        _networkClient = networkClient;
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
}
