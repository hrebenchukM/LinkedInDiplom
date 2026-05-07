using Identity.Client.Contracts.Resources;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;

namespace Identity.Client.Resources;

// Обёртка над IAuthenticationService
public class AuthenticationResource : IAuthenticationResource
{
    // Настоящая бизнес-логика авторизации
    private readonly IAuthenticationService _authenticationService;

    // Получаем IAuthenticationService через DI
    public AuthenticationResource(IAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    // Передаём логин в сервис
    public Task<LoginResult> LoginAsync(LoginParameters parameters)
        => _authenticationService.LoginAsync(parameters);

    // Передаём refresh в сервис
    public Task<RefreshTokenResult> RefreshTokenAsync(RefreshTokenParameters parameters)
        => _authenticationService.RefreshTokenAsync(parameters);

    // Передаём logout одного токена в сервис
    public Task<RevokeTokenResult> RevokeTokenAsync(RevokeTokenParameters parameters)
        => _authenticationService.RevokeTokenAsync(parameters);

    // Передаём logout всех токенов пользователя в сервис
    public Task<RevokeTokenResult> RevokeAllUserTokensAsync(string userId)
        => _authenticationService.RevokeAllUserTokensAsync(userId);
}