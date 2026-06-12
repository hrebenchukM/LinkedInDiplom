namespace Messaging.DataAccess.Entities;

// Медиа сообщения (ссылка на внешний ресурс).
public class MessageMedia
{
    public Guid Id { get; set; }

    public Guid MessageId { get; set; }

    public string MediaUrl { get; set; } = default!;

    public string MediaType { get; set; } = default!;

    public DateTime CreatedAt { get; set; }
}
