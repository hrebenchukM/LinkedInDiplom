namespace Professional.Contracts.Parameters.Experience;

// Параметры для получения одного опыта работы
public record GetExperienceByIdParameters
{
    public string UserId { get; init; } = default!;

    public Guid ExperienceId { get; init; }
}