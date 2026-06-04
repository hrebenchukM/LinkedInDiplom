namespace Identity.Contracts.Parameters;

// Данные для обновления access token
public record RefreshTokenParameters
{
    // Refresh token, который пользователь получил при логине
    public string RefreshToken { get; init; } = default!;
}
//Он передаёт в Identity-сервис вещи
//ExternalLoginRequest — это данные, которые пришли с фронта.
//ExternalLoginParameters - это почти те же данные, но уже для передачи внутри backend-а между слоями