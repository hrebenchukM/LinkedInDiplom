namespace Messaging.DataAccess.Entities;

// Участник чата.
public class ChatMember
{
    public Guid Id { get; set; }

    public Guid ChatId { get; set; }

    public string UserId { get; set; } = default!;

    public string? Folder { get; set; }

    public DateTime JoinedAt { get; set; }

    public DateTime? LeftAt { get; set; }
}
