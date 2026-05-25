using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.UserSkill;
using Professional.Contracts.Results;

namespace Professional.Contracts.Services;

// Интерфейс сервиса навыков пользователя
public interface IUserSkillService
{
    Task<IReadOnlyCollection<UserSkillDto>> GetUserSkillsAsync(
        GetUserSkillsParameters parameters);

    Task<UserSkillDto?> GetByIdAsync(
        GetUserSkillByIdParameters parameters);

    Task<UserSkillResult> CreateAsync(
        CreateUserSkillParameters parameters);

    Task<UserSkillResult> UpdateAsync(
        UpdateUserSkillParameters parameters);

    Task<UserSkillResult> PatchAsync(
        PatchUserSkillParameters parameters);

    Task<UserSkillResult> DeleteAsync(
        DeleteUserSkillParameters parameters);
}
