using System.ComponentModel.DataAnnotations;

namespace Facade.NotificationsManagement.Contracts.Requests.UserActivity;

public record CreateUserActivityRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Action { get; init; } = default!;

    [StringLength(100)]
    public string? EntityType { get; init; }

    public Guid? EntityId { get; init; }

    [StringLength(2000)]
    public string? Meta { get; init; }
}
