using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Experience;

// Запрос на полное обновление опыта работы
public record UpdateExperienceRequest
{
    public Guid? CompanyId { get; init; }

    [Required]
    [MaxLength(200)]
    public string Position { get; init; } = default!;

    [MaxLength(100)]
    public string? EmploymentType { get; init; }

    [MaxLength(100)]
    public string? WorkLocationType { get; init; }

    [MaxLength(200)]
    public string? Location { get; init; }

    [Required]
    public DateOnly StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    [MaxLength(4000)]
    public string? Description { get; init; }
}