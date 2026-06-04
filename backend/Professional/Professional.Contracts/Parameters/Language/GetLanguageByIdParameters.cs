namespace Professional.Contracts.Parameters.Language;

// Получить язык по Id
public record GetLanguageByIdParameters
{
    public Guid LanguageId { get; init; }
}
