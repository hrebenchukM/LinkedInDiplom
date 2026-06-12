namespace Professional.Contracts.Parameters.Academy;

// Получить учебное заведение по Id
public record GetAcademyByIdParameters
{
    public Guid AcademyId { get; init; }
}
