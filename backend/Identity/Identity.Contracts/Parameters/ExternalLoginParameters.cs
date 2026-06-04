namespace Identity.Contracts.Parameters;

//Parameters — это данные, которые передают в сервис, чтобы он смог выполнить действие.
public record ExternalLoginParameters
{
    public required string Provider { get; init; }
    public required string ProviderToken { get; init; }
}
//Он передаёт в Identity-сервис вещи
//ExternalLoginRequest — это данные, которые пришли с фронта.
//ExternalLoginParameters - это почти те же данные, но уже для передачи внутри backend-а между слоями.