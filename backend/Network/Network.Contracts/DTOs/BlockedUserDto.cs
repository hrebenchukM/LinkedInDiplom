namespace Network.Contracts.DTOs;

// DTO блокировки пользователя
public record BlockedUserDto
{
    public Guid Id { get; init; }

    public string UserId { get; init; } = default!;

    public string BlockedUserId { get; init; } = default!;

    public DateTime BlockedAt { get; init; }

    public DateTime? UnblockedAt { get; init; }
}
