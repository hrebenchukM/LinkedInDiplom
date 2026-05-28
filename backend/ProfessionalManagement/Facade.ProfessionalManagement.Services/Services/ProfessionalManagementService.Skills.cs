using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Skill;
using Facade.ProfessionalManagement.Contracts.Requests.UserSkill;
using Facade.ProfessionalManagement.Contracts.Responses;
using Professional.Contracts.Parameters.Skill;
using Professional.Contracts.Parameters.UserSkill;

namespace Facade.ProfessionalManagement.Services.Services;

public partial class ProfessionalManagementService
{
    // Получить навык в справочнике по Id
    public async Task<SkillDto?> GetSkillByIdAsync(Guid skillId)
    {
        var skill = await _professionalClient.Skills.GetByIdAsync(
            new GetSkillByIdParameters
            {
                SkillId = skillId
            });

        return skill == null ? null : MapSkillToFacadeDto(skill);
    }

    // Создать навык в справочнике
    public async Task<SkillResponse> CreateSkillAsync(CreateSkillRequest request)
    {
        var result = await _professionalClient.Skills.CreateAsync(
            new CreateSkillParameters
            {
                Name = request.Name,
                Description = request.Description
            });

        return new SkillResponse
        {
            Success = result.Succeeded,
            Skill = result.Skill == null ? null : MapSkillToFacadeDto(result.Skill),
            Errors = result.Errors
        };
    }

    // Получить все мои навыки
    public async Task<IReadOnlyCollection<UserSkillDto>> GetMyUserSkillsAsync(string userId)
    {
        var userSkills = await _professionalClient.UserSkills.GetUserSkillsAsync(
            new GetUserSkillsParameters
            {
                UserId = userId
            });

        return userSkills
            .Select(MapUserSkillToFacadeDto)
            .ToList();
    }

    // Получить один мой навык по Id
    public async Task<UserSkillDto?> GetMyUserSkillByIdAsync(string userId, Guid userSkillId)
    {
        var userSkill = await _professionalClient.UserSkills.GetByIdAsync(
            new GetUserSkillByIdParameters
            {
                UserId = userId,
                UserSkillId = userSkillId
            });

        return userSkill == null ? null : MapUserSkillToFacadeDto(userSkill);
    }

    // Добавить навык текущему пользователю
    public async Task<UserSkillResponse> CreateMyUserSkillAsync(
        string userId,
        CreateUserSkillRequest request)
    {
        var result = await _professionalClient.UserSkills.CreateAsync(
            new CreateUserSkillParameters
            {
                UserId = userId,
                SkillId = request.SkillId,
                Level = request.Level,
                IsMain = request.IsMain,
                OrderIndex = request.OrderIndex
            });

        return new UserSkillResponse
        {
            Success = result.Succeeded,
            UserSkill = result.UserSkill == null ? null : MapUserSkillToFacadeDto(result.UserSkill),
            Errors = result.Errors
        };
    }

    // Полностью обновить навык пользователя
    public async Task<UserSkillResponse> UpdateMyUserSkillAsync(
        string userId,
        Guid userSkillId,
        UpdateUserSkillRequest request)
    {
        var result = await _professionalClient.UserSkills.UpdateAsync(
            new UpdateUserSkillParameters
            {
                UserId = userId,
                UserSkillId = userSkillId,
                SkillId = request.SkillId,
                Level = request.Level,
                IsMain = request.IsMain,
                OrderIndex = request.OrderIndex
            });

        return new UserSkillResponse
        {
            Success = result.Succeeded,
            UserSkill = result.UserSkill == null ? null : MapUserSkillToFacadeDto(result.UserSkill),
            Errors = result.Errors
        };
    }

    // Частично обновить навык пользователя
    public async Task<UserSkillResponse> PatchMyUserSkillAsync(
        string userId,
        Guid userSkillId,
        PatchUserSkillRequest request)
    {
        var result = await _professionalClient.UserSkills.PatchAsync(
            new PatchUserSkillParameters
            {
                UserId = userId,
                UserSkillId = userSkillId,
                SkillId = request.SkillId,
                Level = request.Level,
                IsMain = request.IsMain,
                OrderIndex = request.OrderIndex
            });

        return new UserSkillResponse
        {
            Success = result.Succeeded,
            UserSkill = result.UserSkill == null ? null : MapUserSkillToFacadeDto(result.UserSkill),
            Errors = result.Errors
        };
    }

    // Удалить навык пользователя
    public async Task<UserSkillResponse> DeleteMyUserSkillAsync(
        string userId,
        Guid userSkillId)
    {
        var result = await _professionalClient.UserSkills.DeleteAsync(
            new DeleteUserSkillParameters
            {
                UserId = userId,
                UserSkillId = userSkillId
            });

        return new UserSkillResponse
        {
            Success = result.Succeeded,
            UserSkill = result.UserSkill == null ? null : MapUserSkillToFacadeDto(result.UserSkill),
            Errors = result.Errors
        };
    }

    private static SkillDto MapSkillToFacadeDto(Professional.Contracts.DTOs.SkillDto skill)
    {
        return new SkillDto
        {
            Id = skill.Id,
            Name = skill.Name,
            Description = skill.Description,
            CreatedAt = skill.CreatedAt,
            UpdatedAt = skill.UpdatedAt
        };
    }

    private static UserSkillDto MapUserSkillToFacadeDto(Professional.Contracts.DTOs.UserSkillDto userSkill)
    {
        return new UserSkillDto
        {
            Id = userSkill.Id,
            UserId = userSkill.UserId,
            SkillId = userSkill.SkillId,
            Level = userSkill.Level,
            IsMain = userSkill.IsMain,
            OrderIndex = userSkill.OrderIndex,
            CreatedAt = userSkill.CreatedAt,
            UpdatedAt = userSkill.UpdatedAt
        };
    }
}
