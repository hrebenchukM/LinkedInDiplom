namespace Profile.DataAccess.Entities;

// Запись о просмотре профиля пользователя (журнал событий).
public class ProfileView
{
    public Guid Id { get; set; }

    // Id владельца профиля из Identity.AspNetUsers.
    public string ProfileOwnerId { get; set; } = default!;

    // Id зрителя из Identity; null для анонимного просмотра.
    public string? ViewerUserId { get; set; }

    public string ViewerIp { get; set; } = default!;

    public string? ViewerUserAgent { get; set; }

    public string? Source { get; set; }

    public DateTime ViewedAt { get; set; }
}
