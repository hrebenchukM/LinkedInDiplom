namespace Profile.Contracts.DTOs;

// Безопасная модель профиля пользователя для передачи наружу
public record UserProfileDto
{
    // Id профиля
    public Guid Id { get; init; }

    // Id пользователя из Identity
    public string UserId { get; init; } = default!;

    // Имя пользователя
    public string? FirstName { get; init; }

    // Фамилия пользователя
    public string? LastName { get; init; }

    // Полное имя
    public string? FullName { get; init; }

    // Ссылка на аватарку
    public string? AvatarUrl { get; init; }

    // Ссылка на шапку профиля
    public string? HeaderUrl { get; init; }

    // Заголовок профиля
    public string? ProfileTitle { get; init; }

    // Краткое описание / слоган
    public string? Headline { get; init; }

    // Общая информация о пользователе
    public string? GenInfo { get; init; }

    // Университет
    public string? University { get; init; }

    // Локация
    public string? Location { get; init; }

    // Портфолио
    public string? PortfolioUrl { get; init; }

    // Компания это или обычный пользователь
    public bool IsCompany { get; init; }

    // Когда профиль был создан
    public DateTime CreatedAt { get; init; }

    // Когда профиль был обновлён
    public DateTime? UpdatedAt { get; init; }
}