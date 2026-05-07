namespace Identity.Contracts.Parameters;

// Данные для поиска пользователя по Id
public record GetUserByIdParameters
{
    // Id пользователя
    public string UserId { get; init; } = default!;
}