using Network.Contracts.DTOs;
using Network.Contracts.Parameters.Contact;
using Network.Contracts.Results;

namespace Network.Contracts.Services;

// Интерфейс сервиса контактов между пользователями
public interface IContactService
{
    Task<ContactResult> SendRequestAsync(SendContactRequestParameters parameters);

    Task<IReadOnlyCollection<ContactDto>> GetMyContactsAsync(GetMyContactsParameters parameters);

    Task<ContactDto?> GetByIdAsync(GetContactByIdParameters parameters);

    Task<ContactResult> AcceptAsync(RespondToContactParameters parameters);

    Task<ContactResult> RejectAsync(RespondToContactParameters parameters);

    Task<ContactResult> CancelAsync(CancelContactRequestParameters parameters);

    Task<ContactResult> RemoveAsync(RemoveContactParameters parameters);
}
