using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.MessageRead;
using Messaging.Contracts.Results;

namespace Messaging.Contracts.Services;

public interface IMessageReadService
{
    Task<MessageReadResult> MarkReadAsync(MarkMessageReadParameters parameters);
    Task<IReadOnlyCollection<MessageReadDto>> GetMessageReadsAsync(GetMessageReadsParameters parameters);
}
