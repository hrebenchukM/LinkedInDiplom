using Identity.Client.Contracts.Resources;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;
using static System.Net.WebRequestMethods;

namespace Identity.Client.Resources;

/// <summary>
/// Resource-адаптер между Identity.Client и core-сервисом аутентификации.
/// Это seam для будущей замены in-process вызова на HTTP при выносе в микросервис.(прослойка)
/// </summary>
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


//AuthenticationResource сам ничего не делает.Он просто принимает запрос и передаёт его дальше в IAuthenticationService.

//Зачем он нужен?

//Чтобы сейчас внутри монолита вызывать Identity напрямую:

//Facade
//  ↓
//Identity.Client
//  ↓
//AuthenticationResource
//  ↓
//Identity.Services

//А потом, когда Identity станет отдельным микросервисом, можно будет заменить внутренний вызов на HTTP:

//Facade
//  ↓
//Identity.Client
//  ↓
//HTTP запрос в Identity microservice

//И Facade почти не придётся переписывать