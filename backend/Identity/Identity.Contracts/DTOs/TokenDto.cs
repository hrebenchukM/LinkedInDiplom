namespace Identity.Contracts.DTOs;

public record TokenDto
{
    public string AccessToken { get; init; } = default!;
    public string RefreshToken { get; init; } = default!;
    public DateTime AccessTokenExpiresAt { get; init; }
    public DateTime RefreshTokenExpiresAt { get; init; }
    public string TokenType { get; init; } = "Bearer";
}
