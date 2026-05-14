namespace Facade.AccountManagement.Contracts.DTOs;

public record AuthTokenDto
{
    public string AccessToken { get; init; } = default!;
    public string RefreshToken { get; init; } = default!;
    public DateTime ExpiresAt { get; init; }
    public string TokenType { get; init; } = "Bearer";
}
