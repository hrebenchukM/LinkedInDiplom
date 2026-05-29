using System.ComponentModel.DataAnnotations;

namespace Facade.AccountManagement.Contracts.Requests;

// Запрос на регистрацию
public record RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; init; } = default!;

    [Required]
    [MinLength(3)]
    [MaxLength(50)]
    public string UserName { get; init; } = default!;

    [Required]
    [MinLength(6)]
    public string Password { get; init; } = default!;

    [MaxLength(50)]
    public string? FirstName { get; init; }

    [MaxLength(50)]
    public string? LastName { get; init; }

    // Аватар
    public string? AvatarUrl { get; init; }

    // Заголовок профиля
    [MaxLength(150)]
    public string? ProfileTitle { get; init; }

    // Краткий слоган
    [MaxLength(250)]
    public string? Headline { get; init; }

    // Локация
    [MaxLength(150)]
    public string? Location { get; init; }

    // Университет
    [MaxLength(150)]
    public string? University { get; init; }

    // Портфолио
    public string? PortfolioUrl { get; init; }

    // Компания или обычный пользователь
    public bool IsCompany { get; init; }
}