using Identity.Contracts.DTOs;

namespace Identity.Contracts.Results;

// Результат обновления access token
public record RefreshTokenResult
{
    // Успешно ли обновление токена
    public bool Succeeded { get; init; }

    // Новые токены
    public TokenDto? Token { get; init; }

    // Список ошибок, если обновление не удалось
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}

//что сервис вернул
//Result = ответ внутри backend-а от сервиса
//Response = ответ наружу, который уходит на frontend

//Frontend
//   ↓
//RefreshTokenRequest
//   ↓
//Facade Controller
//   ↓
//RefreshTokenParameters
//   ↓
//Identity Service
//   ↓
//RefreshTokenResult
//   ↓
//Facade превращает в RefreshTokenResponse
//   ↓
//Frontend