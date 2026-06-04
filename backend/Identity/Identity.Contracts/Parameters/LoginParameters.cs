namespace Identity.Contracts.Parameters;

// Данные, которые нужны для входа
public record LoginParameters
{
    // Email пользователя
    public string Email { get; init; } = default!;

    // Пароль пользователя
    public string Password { get; init; } = default!;
}

//Он передаёт в Identity-сервис вещи
//ExternalLoginRequest — это данные, которые пришли с фронта.
//ExternalLoginParameters - это почти те же данные, но уже для передачи внутри backend-а между слоями