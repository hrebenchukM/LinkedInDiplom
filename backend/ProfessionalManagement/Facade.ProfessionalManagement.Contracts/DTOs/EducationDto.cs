namespace Facade.ProfessionalManagement.Contracts.DTOs;

// DTO образования для frontend / Swagger
public record EducationDto
{
    public Guid Id { get; init; }

    public string UserId { get; init; } = default!;

    public Guid? AcademyId { get; init; }

    public string Institution { get; init; } = default!;

    public string? Degree { get; init; }

    public string? FieldOfStudy { get; init; }

    public DateOnly StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    public string? Source { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
