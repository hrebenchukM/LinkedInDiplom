using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.MessageMedia;
using Messaging.Contracts.Results;

namespace Messaging.Client.Contracts.Resources;

public interface IMessageMediaResource
{
    Task<MessageMediaResult> AttachAsync(AttachMessageMediaParameters parameters);
    Task<IReadOnlyCollection<MessageMediaDto>> GetByMessageIdAsync(GetMessageMediaParameters parameters);
    Task<MessageMediaResult> DeleteAsync(DeleteMessageMediaParameters parameters);
}
