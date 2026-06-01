using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Client.Contracts.Resources;

// Ресурс для работы с пользователями
public interface IUserResource
{
    // Получить пользователя по Id
    Task<UserDto?> GetAsync(GetUserByIdParameters parameters);

    // Зарегистрировать пользователя
    Task<RegisterUserResult> RegisterAsync(RegisterUserParameters parameters);
}