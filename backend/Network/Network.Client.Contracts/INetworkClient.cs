using Network.Client.Contracts.Resources;

namespace Network.Client.Contracts;

// Внутренний клиент Network-модуля.
// По аналогии с Profile.Client и Professional.Client.
public interface INetworkClient
{
    IContactResource Contacts { get; }

    IFollowResource Follows { get; }

    IBlockedUserResource BlockedUsers { get; }
}
