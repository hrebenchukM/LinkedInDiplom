using Facade.ProfessionalManagement.Contracts.DTOs;

namespace Facade.ProfessionalManagement.Contracts.Responses;

// Ответ операций с навыком пользователя
public record UserSkillResponse
{
    public bool Success { get; init; }

    public UserSkillDto? UserSkill { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
