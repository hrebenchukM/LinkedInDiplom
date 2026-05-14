using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Identity.Contracts.Configuration;
using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;
using Identity.DataAccess;
using Identity.DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Identity.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IdentityDbContext _dbContext;
    private readonly JwtSettings _jwtSettings;

    public AuthenticationService(
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        IdentityDbContext dbContext,
        IOptions<JwtSettings> jwtSettings)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _dbContext = dbContext;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<LoginResult> LoginAsync(LoginParameters parameters)
    {
        var user = await _userManager.FindByEmailAsync(parameters.Email);
        if (user == null)
        {
            return new LoginResult
            {
                Succeeded = false,
                Errors = new[] { "Invalid email or password." }
            };
        }

        // Check if user is locked out
        if (await _userManager.IsLockedOutAsync(user))
        {
            return new LoginResult
            {
                Succeeded = false,
                Errors = new[] { "Account is locked out." }
            };
        }

        // Verify password
        var passwordValid = await _userManager.CheckPasswordAsync(user, parameters.Password);
        
        if (!passwordValid)
        {
            // Record failed attempt
            await _userManager.AccessFailedAsync(user);
            
            return new LoginResult
            {
                Succeeded = false,
                Errors = new[] { "Invalid email or password." }
            };
        }

        // Reset access failed count on successful login
        await _userManager.ResetAccessFailedCountAsync(user);

        var token = await GenerateTokensAsync(user);
        var userDto = MapToUserDto(user);

        return new LoginResult
        {
            Succeeded = true,
            User = userDto,
            Token = token
        };
    }

    public async Task<RefreshTokenResult> RefreshTokenAsync(RefreshTokenParameters parameters)
    {
        var refreshToken = await _dbContext.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == parameters.RefreshToken);

        if (refreshToken == null || !refreshToken.IsActive)
        {
            return new RefreshTokenResult
            {
                Succeeded = false,
                Errors = new[] { "Invalid or expired refresh token." }
            };
        }

        // Revoke old token
        refreshToken.IsRevoked = true;
        refreshToken.RevokedAt = DateTime.UtcNow;

        // Generate new tokens
        var newToken = await GenerateTokensAsync(refreshToken.User);
        
        // Mark replacement
        refreshToken.ReplacedByToken = newToken.RefreshToken;
        
        await _dbContext.SaveChangesAsync();

        return new RefreshTokenResult
        {
            Succeeded = true,
            Token = newToken
        };
    }

    public async Task<RevokeTokenResult> RevokeTokenAsync(RevokeTokenParameters parameters)
    {
        var refreshToken = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == parameters.RefreshToken);

        if (refreshToken == null)
        {
            return new RevokeTokenResult
            {
                Succeeded = false,
                Errors = new[] { "Token not found." }
            };
        }

        if (!refreshToken.IsActive)
        {
            return new RevokeTokenResult
            {
                Succeeded = false,
                Errors = new[] { "Token is already revoked or expired." }
            };
        }

        refreshToken.IsRevoked = true;
        refreshToken.RevokedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return new RevokeTokenResult
        {
            Succeeded = true
        };
    }

    public async Task<RevokeTokenResult> RevokeAllUserTokensAsync(string userId)
    {
        var activeTokens = await _dbContext.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.IsActive)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync();

        return new RevokeTokenResult
        {
            Succeeded = true
        };
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

        // Clean up old expired tokens for this user
        await CleanupExpiredTokensAsync(user.Id);

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

        if (!string.IsNullOrEmpty(user.FirstName))
            claims.Add(new Claim(ClaimTypes.GivenName, user.FirstName));

        if (!string.IsNullOrEmpty(user.LastName))
            claims.Add(new Claim(ClaimTypes.Surname, user.LastName));

        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        return claims;
    }

    private async Task CleanupExpiredTokensAsync(string userId)
    {
        var expiredTokens = await _dbContext.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();

        if (expiredTokens.Any())
        {
            _dbContext.RefreshTokens.RemoveRange(expiredTokens);
            await _dbContext.SaveChangesAsync();
        }
    }

    private static UserDto MapToUserDto(ApplicationUser user)
    {
        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
