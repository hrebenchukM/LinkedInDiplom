using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Education;

// Запрос на создание записи об образовании
public record CreateEducationRequest
{
    public Guid? AcademyId { get; init; }

    [Required]
    [MaxLength(200)]
    public string Institution { get; init; } = default!;

    [MaxLength(200)]
    public string? Degree { get; init; }

    [MaxLength(200)]
    public string? FieldOfStudy { get; init; }

    [Required]
    public DateOnly StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    [MaxLength(200)]
    public string? Source { get; init; }
}
