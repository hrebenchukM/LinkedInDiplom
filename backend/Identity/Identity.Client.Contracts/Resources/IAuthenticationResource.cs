using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Client.Contracts.Resources;

// Ресурс для авторизации и токенов
public interface IAuthenticationResource
{
    // Логин
    Task<LoginResult> LoginAsync(LoginParameters parameters);

    // Обновить access token по refresh token
    Task<RefreshTokenResult> RefreshTokenAsync(RefreshTokenParameters parameters);

    // Отозвать один refresh token
    Task<RevokeTokenResult> RevokeTokenAsync(RevokeTokenParameters parameters);

    // Отозвать все refresh tokens пользователя
    Task<RevokeTokenResult> RevokeAllUserTokensAsync(string userId);
}