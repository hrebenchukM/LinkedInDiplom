using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.MessageRead;
using Messaging.Contracts.Results;

namespace Messaging.Client.Contracts.Resources;

public interface IMessageReadResource
{
    Task<MessageReadResult> MarkReadAsync(MarkMessageReadParameters parameters);
    Task<IReadOnlyCollection<MessageReadDto>> GetMessageReadsAsync(GetMessageReadsParameters parameters);
}
