namespace Content.DataAccess.Entities;

// Комментарий к посту.
public class Comment
{
    public Guid Id { get; set; }

    public Guid PostId { get; set; }

    // Id автора из Identity.AspNetUsers.
    public string UserId { get; set; } = default!;

    public Guid? ParentCommentId { get; set; }

    public string Content { get; set; } = default!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
