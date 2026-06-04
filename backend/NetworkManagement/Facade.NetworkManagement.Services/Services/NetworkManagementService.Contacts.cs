using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.Contact;
using Facade.NetworkManagement.Contracts.Responses;
using Network.Contracts.Parameters.Contact;
using Network.Contracts.Results;

namespace Facade.NetworkManagement.Services.Services;

public partial class NetworkManagementService
{
    public async Task<ContactResponse> SendContactRequestAsync(string userId, SendContactRequest request)
    {
        var result = await _networkClient.Contacts.SendRequestAsync(new SendContactRequestParameters
        {
            RequesterId = userId,
            ReceiverId = request.ReceiverId
        });

        return MapContactResult(result);
    }

    public async Task<IReadOnlyCollection<ContactDto>> GetMyContactsAsync(string userId)
    {
        var contacts = await _networkClient.Contacts.GetMyContactsAsync(new GetMyContactsParameters
        {
            UserId = userId
        });

        return contacts.Select(MapContactToFacadeDto).ToList();
    }

    public async Task<ContactDto?> GetMyContactByIdAsync(string userId, Guid contactId)
    {
        var contact = await _networkClient.Contacts.GetByIdAsync(new GetContactByIdParameters
        {
            UserId = userId,
            ContactId = contactId
        });

        return contact == null ? null : MapContactToFacadeDto(contact);
    }

    public async Task<ContactResponse> AcceptContactAsync(string userId, Guid contactId)
    {
        var result = await _networkClient.Contacts.AcceptAsync(new RespondToContactParameters
        {
            UserId = userId,
            ContactId = contactId
        });

        return MapContactResult(result);
    }

    public async Task<ContactResponse> RejectContactAsync(string userId, Guid contactId)
    {
        var result = await _networkClient.Contacts.RejectAsync(new RespondToContactParameters
        {
            UserId = userId,
            ContactId = contactId
        });

        return MapContactResult(result);
    }

    public async Task<ContactResponse> DeleteMyContactAsync(string userId, Guid contactId)
    {
        var contact = await _networkClient.Contacts.GetByIdAsync(new GetContactByIdParameters
        {
            UserId = userId,
            ContactId = contactId
        });

        if (contact == null)
        {
            return new ContactResponse
            {
                Success = false,
                Errors = new[] { "Contact not found." }
            };
        }

        ContactResult result;

        if (contact.Status == StatusPending)
        {
            result = await _networkClient.Contacts.CancelAsync(new CancelContactRequestParameters
            {
                UserId = userId,
                ContactId = contactId
            });
        }
        else if (contact.Status == StatusAccepted)
        {
            result = await _networkClient.Contacts.RemoveAsync(new RemoveContactParameters
            {
                UserId = userId,
                ContactId = contactId
            });
        }
        else
        {
            return new ContactResponse
            {
                Success = false,
                Errors = new[] { "Contact not found." }
            };
        }

        return MapContactResult(result);
    }
}
