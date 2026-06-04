using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Contracts.Services;

// Интерфейс сервиса пользователей
public interface IUserService
{
    // Найти пользователя по Id
    Task<UserDto?> GetAsync(GetUserByIdParameters parameters);

    // Зарегистрировать нового пользователя
    Task<RegisterUserResult> RegisterAsync(RegisterUserParameters parameters);
}