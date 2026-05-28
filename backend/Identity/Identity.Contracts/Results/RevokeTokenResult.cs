namespace Identity.Contracts.Results;

// Результат отзыва refresh token
public record RevokeTokenResult
{
    // Успешно ли отключили токен
    public bool Succeeded { get; init; }

    // Список ошибок, если не получилось
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}

//что сервис вернул
//Result = ответ внутри backend-а от сервиса
//Response = ответ наружу, который уходит на frontend

//Frontend
//   ↓
//RevokeTokenRequest
//   ↓
//Facade Controller
//   ↓
//RevokeTokenParameters
//   ↓
//Identity Service
//   ↓
//RevokeTokenResult
//   ↓
//Facade превращает в RevokeTokenResponse
//   ↓
//Frontend