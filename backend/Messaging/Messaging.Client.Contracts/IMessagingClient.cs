using Messaging.Client.Contracts.Resources;

namespace Messaging.Client.Contracts;

public interface IMessagingClient
{
    IChatResource Chats { get; }
    IChatMemberResource ChatMembers { get; }
    IMessageResource Messages { get; }
    IMessageReadResource MessageReads { get; }
    IMessageMediaResource MessageMedia { get; }
}
