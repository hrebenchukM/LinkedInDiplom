namespace Professional.Contracts.Parameters.Education;

// Параметры для получения образования пользователя
public record GetUserEducationsParameters
{
    public string UserId { get; init; } = default!;
}
