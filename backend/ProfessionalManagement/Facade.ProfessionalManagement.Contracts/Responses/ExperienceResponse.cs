using Facade.ProfessionalManagement.Contracts.DTOs;

namespace Facade.ProfessionalManagement.Contracts.Responses;

// Ответ операций с опытом работы
public record ExperienceResponse
{
    public bool Success { get; init; }

    public ExperienceDto? Experience { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}