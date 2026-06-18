using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Identity.Contracts.Configuration;
using Identity.Contracts.Services;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Identity.Services.Services;

// Сервис для создания и проверки токенов
public class TokenService : ITokenService
{
    // Настройки JWT из appsettings.json
    private readonly JwtSettings _jwtSettings;

    // Получаем настройки JWT через DI
    public TokenService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
    }

    // Создать access token
    public string GenerateAccessToken(IEnumerable<Claim> claims)
    {
        // Создаём секретный ключ из строки SecretKey
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));

        // Указываем алгоритм подписи токена
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Создаём сам JWT token
        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            signingCredentials: credentials
        );

        // Превращаем JWT token в строку
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // Создать refresh token
    public string GenerateRefreshToken()
    {
        // Массив случайных байтов
        var randomNumber = new byte[64];

        // Генератор криптографически безопасных случайных чисел
        using var rng = RandomNumberGenerator.Create();

        // Заполняем массив случайными байтами
        rng.GetBytes(randomNumber);

        // Превращаем байты в строку
        return Convert.ToBase64String(randomNumber);
    }

    // Получить данные пользователя из истёкшего access token
    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        // Правила проверки токена
        var tokenValidationParameters = new TokenValidationParameters
        {
            // Проверяем, для кого токен
            ValidateAudience = true,

            // Проверяем, кто выдал токен
            ValidateIssuer = true,

            // Проверяем подпись токена
            ValidateIssuerSigningKey = true,

            // ВАЖНО: срок жизни тут НЕ проверяем,
            // потому что метод специально работает с истёкшим токеном
            ValidateLifetime = false,

            // Ожидаемый issuer
            ValidIssuer = _jwtSettings.Issuer,

            // Ожидаемый audience
            ValidAudience = _jwtSettings.Audience,

            // Ключ для проверки подписи
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_jwtSettings.SecretKey))
        };

        // Обработчик JWT
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            // Проверяем токен и получаем claims пользователя
            var principal = tokenHandler.ValidateToken(
                token,
                tokenValidationParameters,
                out SecurityToken securityToken);

            // Проверяем, что это реально JWT и он подписан правильным алгоритмом
            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(
                    SecurityAlgorithms.HmacSha256,
                    StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            // Возвращаем данные пользователя из токена
            return principal;
        }
        catch
        {
            // Если токен плохой — возвращаем null
            return null;
        }
    }
}