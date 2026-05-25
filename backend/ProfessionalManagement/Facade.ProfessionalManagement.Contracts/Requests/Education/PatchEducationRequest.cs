namespace Facade.ProfessionalManagement.Contracts.Requests.Education;

// Запрос на частичное обновление записи об образовании.
// Если поле null — значит его не меняем.
public record PatchEducationRequest
{
    public Guid? AcademyId { get; init; }

    public string? Institution { get; init; }

    public string? Degree { get; init; }

    public string? FieldOfStudy { get; init; }

    public DateOnly? StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    public string? Source { get; init; }
}
