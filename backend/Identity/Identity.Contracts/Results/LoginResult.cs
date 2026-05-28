using Identity.Contracts.DTOs;

namespace Identity.Contracts.Results;

// Результат входа пользователя
public record LoginResult
{
    // Успешен ли вход
    public bool Succeeded { get; init; }

    // Данные пользователя
    public UserDto? User { get; init; }

    // Access token и refresh token
    public TokenDto? Token { get; init; }

    // Список ошибок, если вход не удался
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
//что сервис вернул
//Result = ответ внутри backend-а от сервиса
//Response = ответ наружу, который уходит на frontend

//Frontend
//   ↓
//LoginRequest
//   ↓
//Facade Controller
//   ↓
//LoginParameters
//   ↓
//Identity Service
//   ↓
//LoginResult
//   ↓
//Facade превращает в LoginResponse
//   ↓
//Frontend