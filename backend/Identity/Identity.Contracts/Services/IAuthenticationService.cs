using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Contracts.Services;

// Интерфейс сервиса авторизации
public interface IAuthenticationService
{
    // Войти по email и паролю
    Task<LoginResult> LoginAsync(LoginParameters parameters);

    // Обновить access token через refresh token
    Task<RefreshTokenResult> RefreshTokenAsync(RefreshTokenParameters parameters);

    // Отключить один refresh token
    Task<RevokeTokenResult> RevokeTokenAsync(RevokeTokenParameters parameters);

    // Отключить все refresh tokens конкретного пользователя
    Task<RevokeTokenResult> RevokeAllUserTokensAsync(string userId);
}