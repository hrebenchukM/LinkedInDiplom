using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.UserSkill;
using Professional.Contracts.Results;

namespace Professional.Client.Contracts.Resources;

// Resource для работы с навыками пользователя.
// Это внутренняя точка доступа фасада к Professional-модулю.
public interface IUserSkillResource
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
