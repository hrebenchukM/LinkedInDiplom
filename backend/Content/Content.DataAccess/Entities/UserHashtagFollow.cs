namespace Content.DataAccess.Entities;

// Подписка пользователя на хэштег.
public class UserHashtagFollow
{
    public Guid Id { get; set; }

    // Id пользователя из Identity.AspNetUsers.
    public string UserId { get; set; } = default!;

    public Guid HashtagId { get; set; }

    public DateTime FollowedAt { get; set; }

    public DateTime? UnfollowedAt { get; set; }
}
