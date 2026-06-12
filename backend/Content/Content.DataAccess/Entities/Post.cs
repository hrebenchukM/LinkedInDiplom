namespace Content.DataAccess.Entities;

// Пост пользователя.
public class Post
{
    public Guid Id { get; set; }

    // Id автора из Identity.AspNetUsers.
    public string UserId { get; set; } = default!;

    public string Content { get; set; } = default!;

    public string Visibility { get; set; } = default!;

    public int ReactionCount { get; set; }

    public int CommentCount { get; set; }

    public int RepostCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? EditedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
