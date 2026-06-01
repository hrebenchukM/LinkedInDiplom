namespace Identity.Contracts.Parameters;

// Данные для отзыва refresh token
public record RevokeTokenParameters
{
    // Refresh token, который нужно отключить
    public string RefreshToken { get; init; } = default!;
}