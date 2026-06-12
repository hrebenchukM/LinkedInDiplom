using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Skill;
using Professional.Contracts.Results;

namespace Professional.Client.Contracts.Resources;

// Resource для работы с навыками в справочнике.
// Это внутренняя точка доступа фасада к Professional-модулю.
public interface ISkillResource
{
    Task<SkillDto?> GetByIdAsync(
        GetSkillByIdParameters parameters);

    Task<SkillsResult> GetSkillsAsync(
        GetSkillsParameters parameters,
        CancellationToken cancellationToken = default);

    Task<SkillResult> CreateAsync(
        CreateSkillParameters parameters);
}
