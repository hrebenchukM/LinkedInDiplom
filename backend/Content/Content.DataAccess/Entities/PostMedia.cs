namespace Content.DataAccess.Entities;

// Связь поста и медиа.
public class PostMedia
{
    public Guid Id { get; set; }

    public Guid PostId { get; set; }

    public Guid MediaId { get; set; }

    public DateTime CreatedAt { get; set; }
}
