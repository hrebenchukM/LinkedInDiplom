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

// Сервис авторизации: логин, refresh token, logout
public class AuthenticationService : IAuthenticationService
{
    // Готовый сервис Identity для поиска пользователя и проверки пароля
    private readonly UserManager<ApplicationUser> _userManager;

    // Наш сервис для генерации access/refresh токенов
    private readonly ITokenService _tokenService;

    // Доступ к базе, нужен для хранения refresh tokens
    private readonly IdentityDbContext _dbContext;

    // JWT-настройки из appsettings.json
    private readonly JwtSettings _jwtSettings;

    // Получаем зависимости через DI
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

    // Логин пользователя по email и паролю
    public async Task<LoginResult> LoginAsync(LoginParameters parameters)
    {
        // Ищем пользователя по email
        var user = await _userManager.FindByEmailAsync(parameters.Email);

        // Если пользователя нет — ошибка
        if (user == null)
        {
            return new LoginResult
            {
                Succeeded = false,
                Errors = new[] { "Invalid email or password." }
            };
        }

        // Soft-deleted пользователь не может войти
        if (user.DeletedAt != null)
        {
            return new LoginResult
            {
                Succeeded = false,
                Errors = new[] { "Invalid email or password." }
            };
        }

        // Проверяем, не заблокирован ли аккаунт
        if (await _userManager.IsLockedOutAsync(user))
        {
            return new LoginResult
            {
                Succeeded = false,
                Errors = new[] { "Account is locked out." }
            };
        }

        // Проверяем пароль
        var passwordValid = await _userManager.CheckPasswordAsync(user, parameters.Password);

        // Если пароль неверный
        if (!passwordValid)
        {
            // Записываем неудачную попытку входа
            await _userManager.AccessFailedAsync(user);

            return new LoginResult
            {
                Succeeded = false,
                Errors = new[] { "Invalid email or password." }
            };
        }

        // Если вход успешный — сбрасываем счётчик ошибок
        await _userManager.ResetAccessFailedCountAsync(user);

        // Генерируем access token и refresh token
        var token = await GenerateTokensAsync(user);

        // Превращаем ApplicationUser в безопасный UserDto
        var userDto = MapToUserDto(user);

        // Возвращаем успешный результат
        return new LoginResult
        {
            Succeeded = true,
            User = userDto,
            Token = token
        };
    }

    // Обновить access token через refresh token
    public async Task<RefreshTokenResult> RefreshTokenAsync(RefreshTokenParameters parameters)
    {
        // Ищем refresh token в базе вместе с пользователем
        var refreshToken = await _dbContext.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == parameters.RefreshToken);

        // Если токена нет или он неактивный — ошибка
        if (refreshToken == null || !refreshToken.IsActive)
        {
            return new RefreshTokenResult
            {
                Succeeded = false,
                Errors = new[] { "Invalid or expired refresh token." }
            };
        }

        // Soft-deleted пользователь не может обновить токен
        if (refreshToken.User.DeletedAt != null)
        {
            return new RefreshTokenResult
            {
                Succeeded = false,
                Errors = new[] { "Invalid or expired refresh token." }
            };
        }

        // Старый refresh token отключаем
        refreshToken.IsRevoked = true;
        refreshToken.RevokedAt = DateTime.UtcNow;

        // Генерируем новую пару токенов
        var newToken = await GenerateTokensAsync(refreshToken.User);

        // Запоминаем, каким новым токеном заменили старый
        refreshToken.ReplacedByToken = newToken.RefreshToken;

        // Сохраняем изменения в базе
        await _dbContext.SaveChangesAsync();

        return new RefreshTokenResult
        {
            Succeeded = true,
            Token = newToken
        };
    }

    // Отозвать один refresh token
    public async Task<RevokeTokenResult> RevokeTokenAsync(RevokeTokenParameters parameters)
    {
        // Ищем refresh token
        var refreshToken = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == parameters.RefreshToken);

        // Если не нашли — ошибка
        if (refreshToken == null)
        {
            return new RevokeTokenResult
            {
                Succeeded = false,
                Errors = new[] { "Token not found." }
            };
        }

        // Если токен уже отключён или истёк — ошибка
        if (!refreshToken.IsActive)
        {
            return new RevokeTokenResult
            {
                Succeeded = false,
                Errors = new[] { "Token is already revoked or expired." }
            };
        }

        // Отключаем токен
        refreshToken.IsRevoked = true;
        refreshToken.RevokedAt = DateTime.UtcNow;

        // Сохраняем изменения
        await _dbContext.SaveChangesAsync();

        return new RevokeTokenResult
        {
            Succeeded = true
        };
    }

    // Отозвать все активные refresh tokens пользователя
    public async Task<RevokeTokenResult> RevokeAllUserTokensAsync(string userId)
    {
        // Находим все активные токены пользователя
        var activeTokens = await _dbContext.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.IsActive)
            .ToListAsync();

        // Отключаем каждый токен
        foreach (var token in activeTokens)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
        }

        // Сохраняем изменения
        await _dbContext.SaveChangesAsync();

        return new RevokeTokenResult
        {
            Succeeded = true
        };
    }

    // Создать access token + refresh token
    private async Task<TokenDto> GenerateTokensAsync(ApplicationUser user)
    {
        // Создаём claims пользователя
        var claims = await GetUserClaimsAsync(user);

        // Генерируем access token
        var accessToken = _tokenService.GenerateAccessToken(claims);

        // Генерируем refresh token
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Создаём refresh token как запись для базы
        var refreshTokenEntity = new RefreshToken
        {
            Token = refreshToken,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            IsRevoked = false
        };

        // Добавляем refresh token в базу
        _dbContext.RefreshTokens.Add(refreshTokenEntity);

        // Сохраняем
        await _dbContext.SaveChangesAsync();

        // Чистим старые истёкшие токены пользователя
        await CleanupExpiredTokensAsync(user.Id);

        // Возвращаем токены наружу
        return new TokenDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            RefreshTokenExpiresAt = refreshTokenEntity.ExpiresAt
        };
    }

    // Создать claims для JWT
    private async Task<IEnumerable<Claim>> GetUserClaimsAsync(ApplicationUser user)
    {
        // Claims — это данные, которые будут внутри access token
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName!),
            new(ClaimTypes.Email, user.Email!),
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

       
        // Получаем роли пользователя
        var roles = await _userManager.GetRolesAsync(user);

        // Добавляем роли в claims
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        return claims;
    }

    // Удалить старые истёкшие refresh tokens пользователя
    private async Task CleanupExpiredTokensAsync(string userId)
    {
        // Ищем истёкшие токены
        var expiredTokens = await _dbContext.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();

        // Если есть истёкшие токены — удаляем
        if (expiredTokens.Any())
        {
            _dbContext.RefreshTokens.RemoveRange(expiredTokens);
            await _dbContext.SaveChangesAsync();
        }
    }

    // Превратить ApplicationUser в безопасный UserDto
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
}