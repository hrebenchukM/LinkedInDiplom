namespace Identity.Contracts.Parameters;

// Данные для отзыва refresh token
public record RevokeTokenParameters
{
    // Refresh token, который нужно отключить
    public string RefreshToken { get; init; } = default!;
}
//Он передаёт в Identity-сервис вещи
//ExternalLoginRequest — это данные, которые пришли с фронта.
//ExternalLoginParameters - это почти те же данные, но уже для передачи внутри backend-а между слоями