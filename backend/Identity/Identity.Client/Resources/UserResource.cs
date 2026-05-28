using Identity.Client.Contracts.Resources;
using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;

namespace Identity.Client.Resources;

// Обёртка над IUserService
public class UserResource : IUserResource
{
    // Настоящая бизнес-логика пользователей
    private readonly IUserService _userService;

    // Получаем IUserService через DI
    public UserResource(IUserService userService)
    {
        _userService = userService;
    }

    // Просто передаём вызов в сервис
    // прослойка, чтобы  проект был готов к микросервисам. Сейчас он просто вызывает сервис напрямую, а в будущем его можно заменить на HTTP-клиент.
    public Task<UserDto?> GetAsync(GetUserByIdParameters parameters)
        => _userService.GetAsync(parameters);

    // Просто передаём регистрацию в сервис
    public Task<RegisterUserResult> RegisterAsync(RegisterUserParameters parameters)
        => _userService.RegisterAsync(parameters);
}