namespace Professional.Contracts.Parameters.Education;

// Параметры для удаления записи об образовании
public record DeleteEducationParameters
{
    public string UserId { get; init; } = default!;

    public Guid EducationId { get; init; }
}
