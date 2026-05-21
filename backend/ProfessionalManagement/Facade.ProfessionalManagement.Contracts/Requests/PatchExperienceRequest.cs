namespace Facade.ProfessionalManagement.Contracts.Requests;

// Запрос на частичное обновление опыта работы.
// Если поле null — значит его не меняем.
public record PatchExperienceRequest
{
    public Guid? CompanyId { get; init; }

    public string? Position { get; init; }

    public string? EmploymentType { get; init; }

    public string? WorkLocationType { get; init; }

    public string? Location { get; init; }

    public DateOnly? StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    public string? Description { get; init; }
}