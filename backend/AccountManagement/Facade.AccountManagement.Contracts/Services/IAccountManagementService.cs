using Facade.AccountManagement.Contracts.DTOs;
using Facade.AccountManagement.Contracts.Requests;
using Facade.AccountManagement.Contracts.Responses;

namespace Facade.AccountManagement.Contracts.Services;

// Интерфейс фасада AccountManagement
public interface IAccountManagementService
{
    // регистрация
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);

    // логин
    Task<LoginResponse> LoginAsync(LoginRequest request);

    // вход через Google/Facebook
    Task<ExternalLoginResponse> ExternalLoginAsync(ExternalLoginRequest request);

    // обновление токена
    Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request);

    // logout
    Task<LogoutResponse> LogoutAsync(string refreshToken);
    Task<AccountDto?> GetCurrentAccountAsync(string userId);
}