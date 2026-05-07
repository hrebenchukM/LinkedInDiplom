using Identity.Contracts.DTOs;

namespace Identity.Contracts.Results;

// Результат обновления access token
public record RefreshTokenResult
{
    // Успешно ли обновление токена
    public bool Succeeded { get; init; }

    // Новые токены
    public TokenDto? Token { get; init; }

    // Список ошибок, если обновление не удалось
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}