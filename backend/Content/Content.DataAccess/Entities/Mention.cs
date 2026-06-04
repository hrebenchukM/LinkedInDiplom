namespace Content.DataAccess.Entities;

// Упоминание пользователя в посте.
public class Mention
{
    public Guid Id { get; set; }

    public Guid PostId { get; set; }

    // Id упомянутого пользователя из Identity.AspNetUsers.
    public string MentionedUserId { get; set; } = default!;

    public DateTime CreatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
