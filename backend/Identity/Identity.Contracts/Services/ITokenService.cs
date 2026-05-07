using System.Security.Claims;

namespace Identity.Contracts.Services;

// Интерфейс сервиса токенов
public interface ITokenService
{
    // Создать access token по claims пользователя
    string GenerateAccessToken(IEnumerable<Claim> claims);

    // Создать refresh token
    string GenerateRefreshToken();

    // Достать данные пользователя из истёкшего access token
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}