using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;
using Identity.DataAccess;
using Identity.DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Identity.Services;

// Сервис для работы с пользователями
public class UserService : IUserService
{
    // UserManager — готовый сервис ASP.NET Identity для создания пользователей и проверки паролей
    private readonly UserManager<ApplicationUser> _userManager;

    // DbContext — доступ к таблицам базы данных
    private readonly IdentityDbContext _dbContext;

    // Через конструктор получаем нужные зависимости из DI
    public UserService(UserManager<ApplicationUser> userManager, IdentityDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    // Получить пользователя по Id
    public async Task<UserDto?> GetAsync(GetUserByIdParameters parameters)
    {
        // Ищем пользователя в таблице Users без отслеживания изменений
        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == parameters.UserId);

        // Если пользователь не найден — возвращаем null
        if (user == null)
            return null;

        // Если найден — превращаем ApplicationUser в безопасный UserDto
        return MapToDto(user);
    }

    // Зарегистрировать нового пользователя
    public async Task<RegisterUserResult> RegisterAsync(RegisterUserParameters parameters)
    {
        // Создаём объект пользователя для базы
        var user = new ApplicationUser
        {
            UserName = parameters.UserName,
            Email = parameters.Email,
            FirstName = parameters.FirstName,
            LastName = parameters.LastName,
            CreatedAt = DateTime.UtcNow
        };

        // Создаём пользователя через ASP.NET Identity.
        // Identity сам захэширует пароль и сохранит пользователя в AspNetUsers.
        var result = await _userManager.CreateAsync(user, parameters.Password);

        // Если регистрация не удалась — возвращаем ошибки
        if (!result.Succeeded)
        {
            return new RegisterUserResult
            {
                Succeeded = false,
                Errors = result.Errors.Select(e => e.Description)
            };
        }

        // Если всё хорошо — возвращаем успешный результат и данные пользователя
        return new RegisterUserResult
        {
            Succeeded = true,
            User = MapToDto(user)
        };
    }

    // Превращаем ApplicationUser в UserDto
    // Это нужно, чтобы не отдавать наружу служебные поля Identity, например PasswordHash
    private static UserDto MapToDto(ApplicationUser user)
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