using Facade.AccountManagement.Contracts.Requests;
using Facade.AccountManagement.Contracts.Responses;

namespace Facade.AccountManagement.Contracts.Services;

public interface IAccountManagementService
{
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task<LogoutResponse> LogoutAsync(string refreshToken);
}
