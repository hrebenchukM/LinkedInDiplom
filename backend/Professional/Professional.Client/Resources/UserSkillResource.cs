using Professional.Client.Contracts.Resources;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.UserSkill;
using Professional.Contracts.Results;
using Professional.Contracts.Services;

namespace Professional.Client.Resources;

// Реализация Resource для навыков пользователя.
// В модульном монолите она обращается напрямую к IUserSkillService.
public class UserSkillResource : IUserSkillResource
{
    private readonly IUserSkillService _userSkillService;

    public UserSkillResource(IUserSkillService userSkillService)
    {
        _userSkillService = userSkillService;
    }

    public Task<IReadOnlyCollection<UserSkillDto>> GetUserSkillsAsync(
        GetUserSkillsParameters parameters)
    {
        return _userSkillService.GetUserSkillsAsync(parameters);
    }

    public Task<UserSkillDto?> GetByIdAsync(GetUserSkillByIdParameters parameters)
    {
        return _userSkillService.GetByIdAsync(parameters);
    }

    public Task<UserSkillResult> CreateAsync(CreateUserSkillParameters parameters)
    {
        return _userSkillService.CreateAsync(parameters);
    }

    public Task<UserSkillResult> UpdateAsync(UpdateUserSkillParameters parameters)
    {
        return _userSkillService.UpdateAsync(parameters);
    }

    public Task<UserSkillResult> PatchAsync(PatchUserSkillParameters parameters)
    {
        return _userSkillService.PatchAsync(parameters);
    }

    public Task<UserSkillResult> DeleteAsync(DeleteUserSkillParameters parameters)
    {
        return _userSkillService.DeleteAsync(parameters);
    }
}
