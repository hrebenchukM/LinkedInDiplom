using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Skill;
using Professional.Contracts.Results;

namespace Professional.Contracts.Services;

// Интерфейс сервиса навыков в справочнике
public interface ISkillService
{
    Task<SkillDto?> GetByIdAsync(
        GetSkillByIdParameters parameters);

    Task<SkillResult> CreateAsync(
        CreateSkillParameters parameters);
}
