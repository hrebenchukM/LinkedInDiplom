namespace Network.DataAccess.Entities;

// Блокировка пользователя другим пользователем.
public class BlockedUser
{
    public Guid Id { get; set; }

    // Id пользователя, который заблокировал.
    public string UserId { get; set; } = default!;

    // Id заблокированного пользователя.
    public string BlockedUserId { get; set; } = default!;

    public DateTime BlockedAt { get; set; }

    public DateTime? UnblockedAt { get; set; }
}
