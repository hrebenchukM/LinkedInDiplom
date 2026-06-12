namespace Content.Contracts.Parameters.Media;

// Параметры получения медиа по Id
public record GetMediaByIdParameters
{
    public Guid MediaId { get; init; }
}
