using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Contracts.Services;

public interface IAuthenticationService
{
    Task<LoginResult> LoginAsync(LoginParameters parameters);
    Task<RefreshTokenResult> RefreshTokenAsync(RefreshTokenParameters parameters);
    Task<RevokeTokenResult> RevokeTokenAsync(RevokeTokenParameters parameters);
    Task<RevokeTokenResult> RevokeAllUserTokensAsync(string userId);
}
