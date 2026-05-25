namespace Professional.Contracts.Parameters.UserLanguage;

// Параметры для получения языков пользователя
public record GetUserLanguagesParameters
{
    public string UserId { get; init; } = default!;
}
