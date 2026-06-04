using Facade.ProfessionalManagement.Contracts.DTOs;

namespace Facade.ProfessionalManagement.Contracts.Responses;

// Ответ операций с языком пользователя
public record UserLanguageResponse
{
    public bool Success { get; init; }

    public UserLanguageDto? UserLanguage { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
