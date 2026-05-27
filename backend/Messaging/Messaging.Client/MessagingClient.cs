using Messaging.Client.Contracts;
using Messaging.Client.Contracts.Resources;

namespace Messaging.Client;

public class MessagingClient : IMessagingClient
{
    public IChatResource Chats { get; }
    public IChatMemberResource ChatMembers { get; }
    public IMessageResource Messages { get; }
    public IMessageReadResource MessageReads { get; }
    public IMessageMediaResource MessageMedia { get; }

    public MessagingClient(
        IChatResource chats,
        IChatMemberResource chatMembers,
        IMessageResource messages,
        IMessageReadResource messageReads,
        IMessageMediaResource messageMedia)
    {
        Chats = chats;
        ChatMembers = chatMembers;
        Messages = messages;
        MessageReads = messageReads;
        MessageMedia = messageMedia;
    }
}
