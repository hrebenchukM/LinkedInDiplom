namespace Network.DataAccess.Entities;

// Подписчик страницы.
public class PageFollower
{
    public Guid Id { get; set; }

    public Guid PageId { get; set; }

    // Id подписчика из Identity.AspNetUsers.
    public string UserId { get; set; } = default!;

    public DateTime FollowedAt { get; set; }

    public DateTime? UnfollowedAt { get; set; }
}
