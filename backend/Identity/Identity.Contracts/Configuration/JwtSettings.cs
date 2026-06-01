namespace Identity.Contracts.Configuration;

// Настройки JWT-токенов из appsettings.json
public class JwtSettings
{
    // Секретный ключ, которым подписывается access token
    public string SecretKey { get; set; } = default!;

    // Кто выдал токен, например LinkedInAPI
    public string Issuer { get; set; } = default!;

    // Для кого токен, например LinkedInClients
    public string Audience { get; set; } = default!;

    // Сколько минут живёт access token
    public int AccessTokenExpirationMinutes { get; set; } = 15;

    // Сколько дней живёт refresh token
    public int RefreshTokenExpirationDays { get; set; } = 7;
}