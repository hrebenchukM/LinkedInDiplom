namespace Professional.Contracts.Parameters;

// Параметры для полного обновления опыта работы
public record UpdateExperienceParameters
{
    public string UserId { get; init; } = default!;

    public Guid ExperienceId { get; init; }

    public Guid? CompanyId { get; init; }

    public string Position { get; init; } = default!;

    public string? EmploymentType { get; init; }

    public string? WorkLocationType { get; init; }

    public string? Location { get; init; }

    public DateOnly StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    public string? Description { get; init; }
}