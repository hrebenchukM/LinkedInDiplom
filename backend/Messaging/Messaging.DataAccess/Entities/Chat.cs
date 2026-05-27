namespace Messaging.DataAccess.Entities;

// Чат.
public class Chat
{
    public Guid Id { get; set; }

    public string CreatedBy { get; set; } = default!;

    public DateTime CreatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
