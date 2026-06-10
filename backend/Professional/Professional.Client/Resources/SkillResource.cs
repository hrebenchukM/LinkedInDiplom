using Professional.Client.Contracts.Resources;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Skill;
using Professional.Contracts.Results;
using Professional.Contracts.Services;

namespace Professional.Client.Resources;

// Реализация Resource для навыков в справочнике.
// В модульном монолите она обращается напрямую к ISkillService.
public class SkillResource : ISkillResource
{
    private readonly ISkillService _skillService;

    public SkillResource(ISkillService skillService)
    {
        _skillService = skillService;
    }

    public Task<SkillDto?> GetByIdAsync(GetSkillByIdParameters parameters)
    {
        return _skillService.GetByIdAsync(parameters);
    }

    public Task<SkillsResult> GetSkillsAsync(
        GetSkillsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        return _skillService.GetSkillsAsync(parameters, cancellationToken);
    }

    public Task<SkillResult> CreateAsync(CreateSkillParameters parameters)
    {
        return _skillService.CreateAsync(parameters);
    }
}
