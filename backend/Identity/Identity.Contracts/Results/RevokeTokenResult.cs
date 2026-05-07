namespace Identity.Contracts.Results;

// Результат отзыва refresh token
public record RevokeTokenResult
{
    // Успешно ли отключили токен
    public bool Succeeded { get; init; }

    // Список ошибок, если не получилось
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}