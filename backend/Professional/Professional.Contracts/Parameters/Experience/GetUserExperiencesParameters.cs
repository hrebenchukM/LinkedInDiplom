namespace Professional.Contracts.Parameters.Experience;

// Параметры для получения опыта работы пользователя
public record GetUserExperiencesParameters
{
    public string UserId { get; init; } = default!;
}