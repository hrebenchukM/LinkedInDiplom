namespace Professional.Contracts.Parameters.Education;

// Параметры для частичного обновления записи об образовании.
// Если поле null — значит его не меняем.
public record PatchEducationParameters
{
    public string UserId { get; init; } = default!;

    public Guid EducationId { get; init; }

    public Guid? AcademyId { get; init; }

    public string? Institution { get; init; }

    public string? Degree { get; init; }

    public string? FieldOfStudy { get; init; }

    public DateOnly? StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    public string? Source { get; init; }
}
