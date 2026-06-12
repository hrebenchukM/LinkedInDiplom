namespace Profile.Contracts.DTOs;

// DTO записи о просмотре профиля (журнал событий)
public record ProfileViewDto
{
    public Guid Id { get; init; }

    public string ProfileOwnerId { get; init; } = default!;

    public string? ViewerUserId { get; init; }

    public string ViewerIp { get; init; } = default!;

    public string? ViewerUserAgent { get; init; }

    public string? Source { get; init; }

    public DateTime ViewedAt { get; init; }
}
