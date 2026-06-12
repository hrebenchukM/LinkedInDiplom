namespace Identity.Contracts.Parameters;

// Данные, которые нужны для регистрации пользователя
public record RegisterUserParameters
{
    // Логин пользователя
    public string UserName { get; init; } = default!;

    // Email пользователя
    public string Email { get; init; } = default!;

    // Пароль пользователя
    public string Password { get; init; } = default!;
}

//Он передаёт в Identity-сервис вещи
//ExternalLoginRequest — это данные, которые пришли с фронта.
//ExternalLoginParameters - это почти те же данные, но уже для передачи внутри backend-а между слоями