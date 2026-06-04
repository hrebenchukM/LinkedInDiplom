namespace Messaging.DataAccess.Entities;

// Факт прочтения сообщения.
public class MessageRead
{
    public Guid Id { get; set; }

    public Guid MessageId { get; set; }

    public string UserId { get; set; } = default!;

    public DateTime ReadAt { get; set; }
}
