using Identity.Client.Contracts.Resources;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;

namespace Identity.Client.Resources;

public class AuthenticationResource : IAuthenticationResource
{
    private readonly IAuthenticationService _authenticationService;

    public AuthenticationResource(IAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    public Task<LoginResult> LoginAsync(LoginParameters parameters)
        => _authenticationService.LoginAsync(parameters);

    public Task<RefreshTokenResult> RefreshTokenAsync(RefreshTokenParameters parameters)
        => _authenticationService.RefreshTokenAsync(parameters);

    public Task<RevokeTokenResult> RevokeTokenAsync(RevokeTokenParameters parameters)
        => _authenticationService.RevokeTokenAsync(parameters);

    public Task<RevokeTokenResult> RevokeAllUserTokensAsync(string userId)
        => _authenticationService.RevokeAllUserTokensAsync(userId);
}
