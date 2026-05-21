using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Professional.Client.Contracts;
using Professional.Contracts.Parameters;

namespace Facade.ProfessionalManagement.Services.Services;

// Фасадный сервис для Professional-модуля.
// Он не работает напрямую с DbContext.
// Он обращается к Professional через IProfessionalClient.
public class ProfessionalManagementService : IProfessionalManagementService
{
    private readonly IProfessionalClient _professionalClient;

    public ProfessionalManagementService(IProfessionalClient professionalClient)
    {
        _professionalClient = professionalClient;
    }

    // Получить весь мой опыт работы
    public async Task<IReadOnlyCollection<ExperienceDto>> GetMyExperiencesAsync(string userId)
    {
        var experiences = await _professionalClient.Experiences.GetUserExperiencesAsync(
            new GetUserExperiencesParameters
            {
                UserId = userId
            });

        return experiences
            .Select(MapToFacadeDto)
            .ToList();
    }

    // Получить один мой опыт работы по Id
    public async Task<ExperienceDto?> GetMyExperienceByIdAsync(string userId, Guid experienceId)
    {
        var experience = await _professionalClient.Experiences.GetByIdAsync(
            new GetExperienceByIdParameters
            {
                UserId = userId,
                ExperienceId = experienceId
            });

        return experience == null ? null : MapToFacadeDto(experience);
    }

    // Создать мой опыт работы
    public async Task<ExperienceResponse> CreateMyExperienceAsync(
        string userId,
        CreateExperienceRequest request)
    {
        var result = await _professionalClient.Experiences.CreateAsync(
            new CreateExperienceParameters
            {
                UserId = userId,
                CompanyId = request.CompanyId,
                Position = request.Position,
                EmploymentType = request.EmploymentType,
                WorkLocationType = request.WorkLocationType,
                Location = request.Location,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Description = request.Description
            });

        return new ExperienceResponse
        {
            Success = result.Succeeded,
            Experience = result.Experience == null ? null : MapToFacadeDto(result.Experience),
            Errors = result.Errors
        };
    }

    // Полностью обновить мой опыт работы
    public async Task<ExperienceResponse> UpdateMyExperienceAsync(
        string userId,
        Guid experienceId,
        UpdateExperienceRequest request)
    {
        var result = await _professionalClient.Experiences.UpdateAsync(
            new UpdateExperienceParameters
            {
                UserId = userId,
                ExperienceId = experienceId,
                CompanyId = request.CompanyId,
                Position = request.Position,
                EmploymentType = request.EmploymentType,
                WorkLocationType = request.WorkLocationType,
                Location = request.Location,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Description = request.Description
            });

        return new ExperienceResponse
        {
            Success = result.Succeeded,
            Experience = result.Experience == null ? null : MapToFacadeDto(result.Experience),
            Errors = result.Errors
        };
    }

    // Частично обновить мой опыт работы
    public async Task<ExperienceResponse> PatchMyExperienceAsync(
        string userId,
        Guid experienceId,
        PatchExperienceRequest request)
    {
        var result = await _professionalClient.Experiences.PatchAsync(
            new PatchExperienceParameters
            {
                UserId = userId,
                ExperienceId = experienceId,
                CompanyId = request.CompanyId,
                Position = request.Position,
                EmploymentType = request.EmploymentType,
                WorkLocationType = request.WorkLocationType,
                Location = request.Location,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Description = request.Description
            });

        return new ExperienceResponse
        {
            Success = result.Succeeded,
            Experience = result.Experience == null ? null : MapToFacadeDto(result.Experience),
            Errors = result.Errors
        };
    }

    // Удалить мой опыт работы
    public async Task<ExperienceResponse> DeleteMyExperienceAsync(
        string userId,
        Guid experienceId)
    {
        var result = await _professionalClient.Experiences.DeleteAsync(
            new DeleteExperienceParameters
            {
                UserId = userId,
                ExperienceId = experienceId
            });

        return new ExperienceResponse
        {
            Success = result.Succeeded,
            Experience = result.Experience == null ? null : MapToFacadeDto(result.Experience),
            Errors = result.Errors
        };
    }

    private static ExperienceDto MapToFacadeDto(Professional.Contracts.DTOs.ExperienceDto experience)
    {
        return new ExperienceDto
        {
            Id = experience.Id,
            UserId = experience.UserId,
            CompanyId = experience.CompanyId,
            Position = experience.Position,
            EmploymentType = experience.EmploymentType,
            WorkLocationType = experience.WorkLocationType,
            Location = experience.Location,
            StartDate = experience.StartDate,
            EndDate = experience.EndDate,
            Description = experience.Description,
            CreatedAt = experience.CreatedAt,
            UpdatedAt = experience.UpdatedAt
        };
    }
}