using Identity.Contracts.DTOs;

namespace Identity.Contracts.Results;

// Результат регистрации пользователя
public record RegisterUserResult
{
    // Успешна ли регистрация
    public bool Succeeded { get; init; }

    // Данные созданного пользователя
    public UserDto? User { get; init; }

    // Список ошибок, если регистрация не удалась
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}

//что сервис вернул
//Result = ответ внутри backend-а от сервиса
//Response = ответ наружу, который уходит на frontend

//Frontend
//   ↓
//RegisterUserRequest
//   ↓
//Facade Controller
//   ↓
//RegisterUserParameters
//   ↓
//Identity Service
//   ↓
//RegisterUserResult
//   ↓
//Facade превращает в RegisterUserResponse
//   ↓
//Frontend