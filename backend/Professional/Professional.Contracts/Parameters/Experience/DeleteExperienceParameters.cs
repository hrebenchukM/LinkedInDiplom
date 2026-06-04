namespace Professional.Contracts.Parameters.Experience;

// Параметры для удаления опыта работы
public record DeleteExperienceParameters
{
    public string UserId { get; init; } = default!;

    public Guid ExperienceId { get; init; }
}