namespace Notifications.DataAccess.Entities;

public class UserActivity
{
    public Guid Id { get; set; }

    public string UserId { get; set; } = default!;

    public string Action { get; set; } = default!;

    public string? EntityType { get; set; }

    public Guid? EntityId { get; set; }

    public string? Meta { get; set; }

    public DateTime CreatedAt { get; set; }
}
