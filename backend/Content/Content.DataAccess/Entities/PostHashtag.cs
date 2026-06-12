namespace Content.DataAccess.Entities;

// Связь поста и хэштега.
public class PostHashtag
{
    public Guid Id { get; set; }

    public Guid PostId { get; set; }

    public Guid HashtagId { get; set; }

    public DateTime CreatedAt { get; set; }
}
