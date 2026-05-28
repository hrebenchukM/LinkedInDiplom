using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Education;

// Запрос на частичное обновление записи об образовании.
// Если поле null — значит его не меняем.
public record PatchEducationRequest
{
    public Guid? AcademyId { get; init; }

    [MaxLength(200)]
    public string? Institution { get; init; }

    [MaxLength(200)]
    public string? Degree { get; init; }

    [MaxLength(200)]
    public string? FieldOfStudy { get; init; }

    public DateOnly? StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    [MaxLength(200)]
    public string? Source { get; init; }
}
