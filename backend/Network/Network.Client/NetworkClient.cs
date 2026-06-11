using Network.Client.Contracts;
using Network.Client.Contracts.Resources;

namespace Network.Client;

// Внутренний клиент Network-модуля.
// Отдаёт доступ к Network resources.
public class NetworkClient : INetworkClient
{
    public IContactResource Contacts { get; }

    public IFollowResource Follows { get; }

    public IBlockedUserResource BlockedUsers { get; }

    public IUserGroupResource UserGroups { get; }

    public IGroupMemberResource GroupMembers { get; }

    public IGroupPostResource GroupPosts { get; }

    public IPageResource Pages { get; }

    public IPageAdminResource PageAdmins { get; }

    public IPageFollowerResource PageFollowers { get; }

    public INetworkUserGraphResource UserGraph { get; }

    public NetworkClient(
        IContactResource contacts,
        IFollowResource follows,
        IBlockedUserResource blockedUsers,
        IUserGroupResource userGroups,
        IGroupMemberResource groupMembers,
        IGroupPostResource groupPosts,
        IPageResource pages,
        IPageAdminResource pageAdmins,
        IPageFollowerResource pageFollowers,
        INetworkUserGraphResource userGraph)
    {
        Contacts = contacts;
        Follows = follows;
        BlockedUsers = blockedUsers;
        UserGroups = userGroups;
        GroupMembers = groupMembers;
        GroupPosts = groupPosts;
        Pages = pages;
        PageAdmins = pageAdmins;
        PageFollowers = pageFollowers;
        UserGraph = userGraph;
    }
}
