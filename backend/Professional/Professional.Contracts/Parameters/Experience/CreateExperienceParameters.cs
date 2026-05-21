namespace Professional.Contracts.Parameters.Experience;

// Параметры для создания опыта работы
public record CreateExperienceParameters
{
    public string UserId { get; init; } = default!;

    public Guid? CompanyId { get; init; }

    public string Position { get; init; } = default!;

    public string? EmploymentType { get; init; }

    public string? WorkLocationType { get; init; }

    public string? Location { get; init; }

    public DateOnly StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    public string? Description { get; init; }
}