namespace Messaging.DataAccess.Entities;

// Сообщение в чате.
public class Message
{
    public Guid Id { get; set; }

    public Guid ChatId { get; set; }

    public string SenderId { get; set; } = default!;

    public string Content { get; set; } = default!;

    public DateTime CreatedAt { get; set; }

    public DateTime? EditedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
