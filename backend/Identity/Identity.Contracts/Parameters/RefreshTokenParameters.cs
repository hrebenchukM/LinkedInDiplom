namespace Identity.Contracts.Parameters;

// Данные для обновления access token
public record RefreshTokenParameters
{
    // Refresh token, который пользователь получил при логине
    public string RefreshToken { get; init; } = default!;
}