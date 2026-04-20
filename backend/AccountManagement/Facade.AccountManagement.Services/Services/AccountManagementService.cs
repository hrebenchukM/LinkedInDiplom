using Facade.AccountManagement.Contracts.DTOs;
using Facade.AccountManagement.Contracts.Requests;
using Facade.AccountManagement.Contracts.Responses;
using Facade.AccountManagement.Contracts.Services;
using Identity.Client.Contracts;
using Identity.Contracts.Parameters;

namespace Facade.AccountManagement.Services.Services;

public class AccountManagementService : IAccountManagementService
{
    private readonly IIdentityClient _identityClient;

    public AccountManagementService(IIdentityClient identityClient)
    {
        _identityClient = identityClient;
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        var result = await _identityClient.Users.RegisterAsync(new RegisterUserParameters
        {
            Email = request.Email,
            UserName = request.UserName,
            Password = request.Password,
            FirstName = request.FirstName,
            LastName = request.LastName
        });

        if (!result.Succeeded || result.User == null)
        {
            return new RegisterResponse
            {
                Success = false,
                Errors = result.Errors
            };
        }

        return new RegisterResponse
        {
            Success = true,
            Account = MapToAccountDto(result.User)
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var result = await _identityClient.Authentication.LoginAsync(new LoginParameters
        {
            Email = request.Email,
            Password = request.Password
        });

        if (!result.Succeeded || result.User == null || result.Token == null)
        {
            return new LoginResponse
            {
                Success = false,
                Errors = result.Errors
            };
        }

        return new LoginResponse
        {
            Success = true,
            Account = MapToAccountDto(result.User),
            Token = new AuthTokenDto
            {
                AccessToken = result.Token.AccessToken,
                RefreshToken = result.Token.RefreshToken,
                ExpiresAt = result.Token.AccessTokenExpiresAt,
                TokenType = result.Token.TokenType
            }
        };
    }

    public async Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var result = await _identityClient.Authentication.RefreshTokenAsync(
            new RefreshTokenParameters
            {
                RefreshToken = request.RefreshToken
            });

        if (!result.Succeeded || result.Token == null)
        {
            return new RefreshTokenResponse
            {
                Success = false,
                Errors = result.Errors
            };
        }

        return new RefreshTokenResponse
        {
            Success = true,
            Token = new AuthTokenDto
            {
                AccessToken = result.Token.AccessToken,
                RefreshToken = result.Token.RefreshToken,
                ExpiresAt = result.Token.AccessTokenExpiresAt,
                TokenType = result.Token.TokenType
            }
        };
    }

    public async Task<LogoutResponse> LogoutAsync(string refreshToken)
    {
        var result = await _identityClient.Authentication.RevokeTokenAsync(
            new RevokeTokenParameters
            {
                RefreshToken = refreshToken
            });

        return new LogoutResponse
        {
            Success = result.Succeeded,
            Errors = result.Errors
        };
    }

    private static AccountDto MapToAccountDto(Identity.Contracts.DTOs.UserDto user)
    {
        var fullName = string.IsNullOrWhiteSpace(user.FirstName) && string.IsNullOrWhiteSpace(user.LastName)
            ? null
            : $"{user.FirstName} {user.LastName}".Trim();

        return new AccountDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = fullName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CreatedAt = user.CreatedAt
        };
    }
}
