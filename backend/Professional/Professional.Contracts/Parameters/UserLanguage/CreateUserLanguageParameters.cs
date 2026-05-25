namespace Professional.Contracts.Parameters.UserLanguage;

// Параметры для добавления языка пользователю
public record CreateUserLanguageParameters
{
    public string UserId { get; init; } = default!;

    public Guid LanguageId { get; init; }

    public string? Level { get; init; }
}
