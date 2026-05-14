namespace Profile.DataAccess.Entities;

// Профиль пользователя.
// Это отдельная таблица будущего Profile-микросервиса.
// Здесь НЕ должно быть пароля, email, security_stamp, refresh_token.
public class UserProfile
{
    public Guid Id { get; set; }

    // Id пользователя из Identity.AspNetUsers.
    // В будущем это будет просто внешний идентификатор из Identity-сервиса.
    public string UserId { get; set; } = null!;

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? AvatarUrl { get; set; }

    public string? HeaderUrl { get; set; }

    public string? ProfileTitle { get; set; }

    public string? Headline { get; set; }

    public string? GenInfo { get; set; }

    public string? University { get; set; }

    public string? Location { get; set; }

    public string? PortfolioUrl { get; set; }

    public bool IsCompany { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}