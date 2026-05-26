namespace Network.DataAccess.Entities;

// Подписка одного пользователя на другого.
public class Follow
{
    public Guid Id { get; set; }

    // Id подписчика из Identity.AspNetUsers.
    public string FollowerId { get; set; } = default!;

    // Id пользователя, на которого подписались.
    public string FollowingId { get; set; } = default!;

    public DateTime FollowedAt { get; set; }

    public DateTime? UnfollowedAt { get; set; }
}
