namespace Professional.Contracts.Parameters.Education;

// Параметры для получения одной записи об образовании
public record GetEducationByIdParameters
{
    public string UserId { get; init; } = default!;

    public Guid EducationId { get; init; }
}
