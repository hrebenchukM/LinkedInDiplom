using System.ComponentModel.DataAnnotations;

namespace Facade.ProfessionalManagement.Contracts.Requests.Experience;

// Запрос на частичное обновление опыта работы.
// Если поле null — значит его не меняем.
public record PatchExperienceRequest : IValidatableObject
{
    public Guid? CompanyId { get; init; }

    [MaxLength(200)]
    public string? Position { get; init; }

    [MaxLength(100)]
    public string? EmploymentType { get; init; }

    [MaxLength(100)]
    public string? WorkLocationType { get; init; }

    [MaxLength(200)]
    public string? Location { get; init; }

    public DateOnly? StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    [MaxLength(4000)]
    public string? Description { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (StartDate.HasValue && EndDate.HasValue && EndDate < StartDate)
        {
            yield return new ValidationResult(
                "EndDate must be greater than or equal to StartDate.",
                [nameof(EndDate), nameof(StartDate)]);
        }
    }
}