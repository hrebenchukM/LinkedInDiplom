using Network.Client.Contracts.Resources;

namespace Network.Client.Contracts;

// Внутренний клиент Network-модуля.
// По аналогии с Profile.Client и Professional.Client.
public interface INetworkClient
{
    IContactResource Contacts { get; }

    IFollowResource Follows { get; }

    IBlockedUserResource BlockedUsers { get; }

    IUserGroupResource UserGroups { get; }

    IGroupMemberResource GroupMembers { get; }

    IGroupPostResource GroupPosts { get; }

    IPageResource Pages { get; }

    IPageAdminResource PageAdmins { get; }

    IPageFollowerResource PageFollowers { get; }
}
