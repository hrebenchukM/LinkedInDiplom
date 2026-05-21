namespace Professional.Contracts.Parameters;

// Параметры для удаления опыта работы
public record DeleteExperienceParameters
{
    public string UserId { get; init; } = default!;

    public Guid ExperienceId { get; init; }
}