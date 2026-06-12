using System.ComponentModel.DataAnnotations;

namespace Facade.NetworkManagement.Contracts.Requests.Follow;

// Запрос на подписку (цель в FollowingId; подписчик из JWT)
public record FollowUserRequest
{
    [Required]
    public string FollowingId { get; init; } = default!;
}
