using Network.Client.Contracts.Resources;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.Contact;
using Network.Contracts.Results;
using Network.Contracts.Services;

namespace Network.Client.Resources;

/// <summary>
/// Resource-адаптер для контактов NetworkClient.
/// Делегирует вызов в core service и оставляет фасаду зависимость только от client contracts.
/// </summary>
public class ContactResource : IContactResource
{
    private readonly IContactService _contactService;

    public ContactResource(IContactService contactService)
    {
        _contactService = contactService;
    }

    public Task<ContactResult> SendRequestAsync(SendContactRequestParameters parameters)
    {
        return _contactService.SendRequestAsync(parameters);
    }

    public Task<IReadOnlyCollection<ContactDto>> GetMyContactsAsync(GetMyContactsParameters parameters)
    {
        return _contactService.GetMyContactsAsync(parameters);
    }

    public Task<ContactDto?> GetByIdAsync(GetContactByIdParameters parameters)
    {
        return _contactService.GetByIdAsync(parameters);
    }

    public Task<ContactResult> AcceptAsync(RespondToContactParameters parameters)
    {
        return _contactService.AcceptAsync(parameters);
    }

    public Task<ContactResult> RejectAsync(RespondToContactParameters parameters)
    {
        return _contactService.RejectAsync(parameters);
    }

    public Task<ContactResult> CancelAsync(CancelContactRequestParameters parameters)
    {
        return _contactService.CancelAsync(parameters);
    }

    public Task<ContactResult> RemoveAsync(RemoveContactParameters parameters)
    {
        return _contactService.RemoveAsync(parameters);
    }
}
