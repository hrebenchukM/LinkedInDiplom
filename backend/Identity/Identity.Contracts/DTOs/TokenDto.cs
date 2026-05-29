namespace Identity.Contracts.DTOs;

// DTO с токенами, который вернётся после логина
public record TokenDto
{
    // Короткий токен для доступа к API
    public string AccessToken { get; init; } = default!;

    // Длинный токен для обновления access token
    public string RefreshToken { get; init; } = default!;

    // Когда истекает access token
    public DateTime AccessTokenExpiresAt { get; init; }

    // Когда истекает refresh token
    public DateTime RefreshTokenExpiresAt { get; init; }

    // Тип токена, обычно Bearer
    public string TokenType { get; init; } = "Bearer";
}