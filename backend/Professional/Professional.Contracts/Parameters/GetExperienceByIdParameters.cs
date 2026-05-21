namespace Professional.Contracts.Parameters;

// Параметры для получения одного опыта работы
public record GetExperienceByIdParameters
{
    public string UserId { get; init; } = default!;

    public Guid ExperienceId { get; init; }
}