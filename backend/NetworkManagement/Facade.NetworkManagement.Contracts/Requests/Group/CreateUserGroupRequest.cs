using System.ComponentModel.DataAnnotations;

namespace Facade.NetworkManagement.Contracts.Requests.Group;

// Запрос на создание группы (владелец из JWT)
public record CreateUserGroupRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; init; } = default!;

    [StringLength(2000)]
    public string? Description { get; init; }

    [Url]
    [StringLength(500)]
    public string? AvatarUrl { get; init; }
}
