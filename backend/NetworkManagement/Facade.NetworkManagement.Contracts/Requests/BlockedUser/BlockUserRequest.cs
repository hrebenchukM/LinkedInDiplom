using System.ComponentModel.DataAnnotations;

namespace Facade.NetworkManagement.Contracts.Requests.BlockedUser;

// Запрос на блокировку (цель в BlockedUserId; инициатор из JWT)
public record BlockUserRequest
{
    [Required]
    public string BlockedUserId { get; init; } = default!;
}
