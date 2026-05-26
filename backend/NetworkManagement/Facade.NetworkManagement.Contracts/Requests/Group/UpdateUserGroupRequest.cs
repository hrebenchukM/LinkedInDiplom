using System.ComponentModel.DataAnnotations;

namespace Facade.NetworkManagement.Contracts.Requests.Group;

// Запрос на обновление группы (владелец из JWT)
public record UpdateUserGroupRequest
{
    [Required]
    public string Name { get; init; } = default!;

    public string? Description { get; init; }

    public string? AvatarUrl { get; init; }
}
