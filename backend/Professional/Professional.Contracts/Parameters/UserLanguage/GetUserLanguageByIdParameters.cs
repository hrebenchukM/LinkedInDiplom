namespace Professional.Contracts.Parameters.UserLanguage;

// Параметры для получения одного языка пользователя
public record GetUserLanguageByIdParameters
{
    public string UserId { get; init; } = default!;

    public Guid UserLanguageId { get; init; }
}
