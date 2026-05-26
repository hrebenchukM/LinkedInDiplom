namespace Content.DataAccess.Entities;

// Реакция пользователя на пост.
public class Reaction
{
    public Guid Id { get; set; }

    // Id пользователя из Identity.AspNetUsers.
    public string UserId { get; set; } = default!;

    public Guid PostId { get; set; }

    public string ReactionType { get; set; } = default!;

    public DateTime CreatedAt { get; set; }
}
