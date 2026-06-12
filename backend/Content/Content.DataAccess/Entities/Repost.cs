namespace Content.DataAccess.Entities;

// Репост поста пользователем.
public class Repost
{
    public Guid Id { get; set; }

    // Id пользователя из Identity.AspNetUsers.
    public string UserId { get; set; } = default!;

    public Guid OriginalPostId { get; set; }

    public DateTime RepostedAt { get; set; }

    public DateTime? RemovedAt { get; set; }
}
