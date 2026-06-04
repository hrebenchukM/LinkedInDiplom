using Facade.ProfessionalManagement.Contracts.DTOs;

namespace Facade.ProfessionalManagement.Contracts.Responses;

// Ответ операций с навыком в справочнике
public record SkillResponse
{
    public bool Success { get; init; }

    public SkillDto? Skill { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
