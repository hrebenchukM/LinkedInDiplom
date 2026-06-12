using Facade.ProfessionalManagement.Contracts.DTOs;

namespace Facade.ProfessionalManagement.Contracts.Responses;

// Ответ операций с языком в справочнике
public record LanguageResponse
{
    public bool Success { get; init; }

    public LanguageDto? Language { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
