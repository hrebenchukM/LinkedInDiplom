using Network.Contracts.DTOs;
using Network.Contracts.Parameters.Contact;
using Network.Contracts.Results;

namespace Network.Client.Contracts.Resources;

// Resource для работы с контактами Network-модуля.
// Внутренняя точка доступа фасада к контактам.
public interface IContactResource
{
    Task<ContactResult> SendRequestAsync(SendContactRequestParameters parameters);

    Task<ContactsPageResult> GetMyContactsAsync(
        GetMyContactsParameters parameters,
        CancellationToken cancellationToken = default);

    Task<ContactDto?> GetByIdAsync(GetContactByIdParameters parameters);

    Task<ContactResult> AcceptAsync(RespondToContactParameters parameters);

    Task<ContactResult> RejectAsync(RespondToContactParameters parameters);

    Task<ContactResult> CancelAsync(CancelContactRequestParameters parameters);

    Task<ContactResult> RemoveAsync(RemoveContactParameters parameters);

    Task<ContactPendingCountsDto> GetPendingContactCountsAsync(
        GetContactPendingCountsParameters parameters,
        CancellationToken cancellationToken = default);
}
