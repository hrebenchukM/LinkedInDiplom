namespace Identity.Contracts.DTOs;

// Безопасная модель пользователя для передачи наружу
public record UserDto
{
    // Id пользователя из ASP.NET Identity
    public string Id { get; init; } = default!;

    // Логин пользователя
    public string UserName { get; init; } = default!;

    // Email пользователя
    public string Email { get; init; } = default!;

    // Когда пользователь был создан
    public DateTime CreatedAt { get; init; }

    // Когда пользователь был обновлён
    public DateTime? UpdatedAt { get; init; }
}