namespace Facade.AccountManagement.Contracts.DTOs;

// DTO токена для клиента
public record AuthTokenDto
{
    public string AccessToken { get; init; } = default!; // JWT

    public string RefreshToken { get; init; } = default!; // refresh токен

    public DateTime ExpiresAt { get; init; } // когда access token истекает

    public string TokenType { get; init; } = "Bearer"; // тип токена
}