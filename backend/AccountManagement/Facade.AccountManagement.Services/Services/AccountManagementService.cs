using Facade.AccountManagement.Contracts.DTOs;
using Facade.AccountManagement.Contracts.Requests;
using Facade.AccountManagement.Contracts.Responses;
using Facade.AccountManagement.Contracts.Services;
using Identity.Client.Contracts;
using Identity.Contracts.Parameters;
using Profile.Contracts.DTOs;
using Profile.Client.Contracts.Services;


namespace Facade.AccountManagement.Services.Services;

// Сервис фасада AccountManagement.
// Он принимает клиентские Request-модели,
// вызывает IdentityClient,
// а потом возвращает клиентские Response-модели.
public class AccountManagementService : IAccountManagementService
{
    // Клиент Identity-модуля.
    // Через него фасад обращается к Users и Authentication.
    private readonly IIdentityClient _identityClient;
    private readonly IProfileClient _profileClient;

    // Получаем IIdentityClient через DI
    public AccountManagementService(
        IIdentityClient identityClient,
         IProfileClient profileClient)
    {
        _identityClient = identityClient;
        _profileClient = profileClient;
    }

    // Регистрация аккаунта через фасад
    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        // Переводим RegisterRequest фасада в RegisterUserParameters Identity-модуля
        var result = await _identityClient.Users.RegisterAsync(new RegisterUserParameters
        {
            Email = request.Email,
            UserName = request.UserName,
            Password = request.Password
        });

        // Если Identity не смог зарегистрировать пользователя — возвращаем ошибки клиенту
        if (!result.Succeeded || result.User == null)
        {
            return new RegisterResponse
            {
                Success = false,
                Errors = result.Errors
            };
        }

        // После успешной регистрации создаём профиль в Profile-модуле.
        // Это подготовка к микросервисной архитектуре:
        // Identity отвечает за логин/email/password,
        // Profile отвечает за имя, аватар, headline, location и т.д.
        await _profileClient.UpdateByUserIdAsync(result.User.Id, new UserProfileDto
        {
            UserId = result.User.Id,

            FirstName = request.FirstName,
            LastName = request.LastName,
            AvatarUrl = request.AvatarUrl,
            ProfileTitle = request.ProfileTitle,
            Headline = request.Headline,
            Location = request.Location,
            University = request.University,
            PortfolioUrl = request.PortfolioUrl,
            IsCompany = request.IsCompany
        });

        // Если всё хорошо — возвращаем клиенту AccountDto
        return new RegisterResponse
        {
            Success = true,
            Account = MapToAccountDto(result.User)
        };
    }

    // Логин через фасад
    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        // Переводим LoginRequest фасада в LoginParameters Identity-модуля
        var result = await _identityClient.Authentication.LoginAsync(new LoginParameters
        {
            Email = request.Email,
            Password = request.Password
        });

        // Если логин не удался — возвращаем ошибки
        if (!result.Succeeded || result.User == null || result.Token == null)
        {
            return new LoginResponse
            {
                Success = false,
                Errors = result.Errors
            };
        }

        // Если логин успешный — возвращаем аккаунт и токены
        return new LoginResponse
        {
            Success = true,
            Account = MapToAccountDto(result.User),

            // Переводим TokenDto из Identity в AuthTokenDto фасада
            Token = new AuthTokenDto
            {
                AccessToken = result.Token.AccessToken,
                RefreshToken = result.Token.RefreshToken,
                ExpiresAt = result.Token.AccessTokenExpiresAt,
                TokenType = result.Token.TokenType
            }
        };
    }

    // Обновление access token через refresh token
    public async Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        // Передаём refresh token в Identity-модуль
        var result = await _identityClient.Authentication.RefreshTokenAsync(
            new RefreshTokenParameters
            {
                RefreshToken = request.RefreshToken
            });

        // Если refresh token плохой/истёк/отозван — возвращаем ошибки
        if (!result.Succeeded || result.Token == null)
        {
            return new RefreshTokenResponse
            {
                Success = false,
                Errors = result.Errors
            };
        }

        // Если всё хорошо — возвращаем новую пару токенов
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

    // Logout через refresh token
    public async Task<LogoutResponse> LogoutAsync(string refreshToken)
    {
        // Просим Identity-модуль отозвать refresh token
        var result = await _identityClient.Authentication.RevokeTokenAsync(
            new RevokeTokenParameters
            {
                RefreshToken = refreshToken
            });

        // Возвращаем результат logout
        return new LogoutResponse
        {
            Success = result.Succeeded,
            Errors = result.Errors
        };
    }

    // Получить текущий аккаунт по userId из JWT
    public async Task<AccountDto?> GetCurrentAccountAsync(string userId)
    {
        var user = await _identityClient.Users.GetAsync(new GetUserByIdParameters
        {
            UserId = userId
        });

        if (user == null)
            return null;

        return MapToAccountDto(user);
    }

    // Маппинг UserDto из Identity в AccountDto фасада
    private static AccountDto MapToAccountDto(Identity.Contracts.DTOs.UserDto user)
    {
        // Возвращаем клиентскую модель аккаунта
        return new AccountDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}