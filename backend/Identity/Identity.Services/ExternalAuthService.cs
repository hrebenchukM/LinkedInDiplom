using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Identity.Contracts.Configuration;
using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;
using Identity.DataAccess;
using Identity.DataAccess.Entities;
using Identity.Events.Contracts.Abstractions;
using Identity.Events.Contracts.Events;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Identity.Services;

public class ExternalAuthService : IExternalAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IdentityDbContext _dbContext;
    private readonly JwtSettings _jwtSettings;
    private readonly IDomainEventPublisher _eventPublisher;
    private readonly IHttpClientFactory _httpClientFactory;

    public ExternalAuthService(
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        IdentityDbContext dbContext,
        IOptions<JwtSettings> jwtSettings,
        IDomainEventPublisher eventPublisher,
        IHttpClientFactory httpClientFactory)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _dbContext = dbContext;
        _jwtSettings = jwtSettings.Value;
        _eventPublisher = eventPublisher;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<LoginResult> ExternalLoginAsync(ExternalLoginParameters parameters)
    {
        var externalUser = parameters.Provider.ToLowerInvariant() switch
        {
            "google" => await GetGoogleUserInfoAsync(parameters.ProviderToken),
            "facebook" => await GetFacebookUserInfoAsync(parameters.ProviderToken),
            _ => null
        };

        if (externalUser == null)
        {
            return new LoginResult
            {
                Succeeded = false,
                Errors = new[] { "Invalid provider or token." }
            };
        }

        var user = await _userManager.FindByEmailAsync(externalUser.Email);

        if (user != null && user.DeletedAt != null)
        {
            return new LoginResult
            {
                Succeeded = false,
                Errors = new[] { "Account is deactivated." }
            };
        }

        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = externalUser.Email,
                Email = externalUser.Email,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user);

            if (!createResult.Succeeded)
            {
                return new LoginResult
                {
                    Succeeded = false,
                    Errors = createResult.Errors.Select(e => e.Description)
                };
            }

            await _userManager.AddLoginAsync(user, new UserLoginInfo(
                parameters.Provider, externalUser.ProviderUserId, parameters.Provider));

            await _eventPublisher.PublishAsync(new UserRegisteredEvent
            {
                UserId = user.Id,
                UserName = user.UserName!,
                Email = user.Email!,
                RegisteredAt = user.CreatedAt
            });
        }
        else
        {
            var logins = await _userManager.GetLoginsAsync(user);
            var hasProvider = logins.Any(l =>
                l.LoginProvider.Equals(parameters.Provider, StringComparison.OrdinalIgnoreCase));

            if (!hasProvider)
            {
                await _userManager.AddLoginAsync(user, new UserLoginInfo(
                    parameters.Provider, externalUser.ProviderUserId, parameters.Provider));
            }
        }

        var token = await GenerateTokensAsync(user);

        return new LoginResult
        {
            Succeeded = true,
            User = MapToUserDto(user),
            Token = token
        };
    }

    private async Task<ExternalUserInfo?> GetGoogleUserInfoAsync(string idToken)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(
                $"https://oauth2.googleapis.com/tokeninfo?id_token={idToken}");

            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            var email = json.GetProperty("email").GetString();
            var sub = json.GetProperty("sub").GetString();

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(sub))
                return null;

            return new ExternalUserInfo { Email = email, ProviderUserId = sub };
        }
        catch
        {
            return null;
        }
    }

    private async Task<ExternalUserInfo?> GetFacebookUserInfoAsync(string accessToken)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(
                $"https://graph.facebook.com/me?fields=id,email&access_token={accessToken}");

            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            var email = json.GetProperty("email").GetString();
            var id = json.GetProperty("id").GetString();

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(id))
                return null;

            return new ExternalUserInfo { Email = email, ProviderUserId = id };
        }
        catch
        {
            return null;
        }
    }

    private async Task<TokenDto> GenerateTokensAsync(ApplicationUser user)
    {
        var claims = await GetUserClaimsAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(claims);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            Token = refreshToken,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            IsRevoked = false
        };

        _dbContext.RefreshTokens.Add(refreshTokenEntity);
        await _dbContext.SaveChangesAsync();

        return new TokenDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            RefreshTokenExpiresAt = refreshTokenEntity.ExpiresAt
        };
    }

    private async Task<IEnumerable<Claim>> GetUserClaimsAsync(ApplicationUser user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName!),
            new(ClaimTypes.Email, user.Email!),
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        return claims;
    }

    private static UserDto MapToUserDto(ApplicationUser user)
    {
        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email!,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    private class ExternalUserInfo
    {
        public required string Email { get; init; }
        public required string ProviderUserId { get; init; }
    }
}
