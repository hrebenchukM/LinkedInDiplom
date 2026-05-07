namespace Identity.Contracts.Parameters;

// Данные, которые нужны для входа
public record LoginParameters
{
    // Email пользователя
    public string Email { get; init; } = default!;

    // Пароль пользователя
    public string Password { get; init; } = default!;
}