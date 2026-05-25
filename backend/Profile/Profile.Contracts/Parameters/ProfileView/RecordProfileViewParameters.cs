namespace Profile.Contracts.Parameters.ProfileView;

// Параметры записи просмотра профиля (ViewedAt задаётся в service)
public record RecordProfileViewParameters
{
    public string ProfileOwnerId { get; init; } = default!;

    public string? ViewerUserId { get; init; }

    public string ViewerIp { get; init; } = default!;

    public string? ViewerUserAgent { get; init; }

    public string? Source { get; init; }
}
