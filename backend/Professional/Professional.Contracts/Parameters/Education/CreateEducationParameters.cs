namespace Professional.Contracts.Parameters.Education;

// Параметры для создания записи об образовании
public record CreateEducationParameters
{
    public string UserId { get; init; } = default!;

    public Guid? AcademyId { get; init; }

    public string Institution { get; init; } = default!;

    public string? Degree { get; init; }

    public string? FieldOfStudy { get; init; }

    public DateOnly StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    public string? Source { get; init; }
}
