using System.ComponentModel.DataAnnotations;

namespace Facade.NetworkManagement.Contracts.Requests.Contact;

// Запрос на отправку контакта (получатель в ReceiverId; инициатор из JWT)
public record SendContactRequest
{
    [Required]
    public string ReceiverId { get; init; } = default!;
}
