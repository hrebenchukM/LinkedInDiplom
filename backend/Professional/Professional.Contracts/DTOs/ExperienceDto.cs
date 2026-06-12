namespace Professional.Contracts.DTOs;

// DTO опыта работы пользователя
public record ExperienceDto
{
    public Guid Id { get; init; }

    // Id пользователя из Identity
    public string UserId { get; init; } = default!;

    // Пока nullable, потому что компании добавим позже
    public Guid? CompanyId { get; init; }

    public string Position { get; init; } = default!;

    public string? EmploymentType { get; init; }

    public string? WorkLocationType { get; init; }

    public string? Location { get; init; }

    public DateOnly StartDate { get; init; }

    public DateOnly? EndDate { get; init; }

    public string? Description { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}