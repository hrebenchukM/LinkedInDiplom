namespace Identity.Contracts.Parameters;

// Данные для поиска пользователя по Id
public record GetUserByIdParameters
{
    // Id пользователя
    public string UserId { get; init; } = default!;
}
//Он передаёт в Identity-сервис вещи
//ExternalLoginRequest — это данные, которые пришли с фронта.
//ExternalLoginParameters - это почти те же данные, но уже для передачи внутри backend-а между слоями