namespace Professional.Contracts.Parameters;

// Параметры для получения опыта работы пользователя
public record GetUserExperiencesParameters
{
    public string UserId { get; init; } = default!;
}