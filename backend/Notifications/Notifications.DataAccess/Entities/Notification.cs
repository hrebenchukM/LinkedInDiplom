namespace Notifications.DataAccess.Entities;

public class Notification
{
    public Guid Id { get; set; }

    public string UserId { get; set; } = default!;

    public string? ActorUserId { get; set; }

    public string Type { get; set; } = default!;

    public string Title { get; set; } = default!;

    public string? Body { get; set; }

    public string? EntityType { get; set; }

    public Guid? EntityId { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
