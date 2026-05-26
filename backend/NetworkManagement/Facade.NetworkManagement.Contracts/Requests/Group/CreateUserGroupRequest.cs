using System.ComponentModel.DataAnnotations;

namespace Facade.NetworkManagement.Contracts.Requests.Group;

// Запрос на создание группы (владелец из JWT)
public record CreateUserGroupRequest
{
    [Required]
    public string Name { get; init; } = default!;

    public string? Description { get; init; }

    public string? AvatarUrl { get; init; }
}
