using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests;
using Facade.ProfessionalManagement.Contracts.Responses;

namespace Facade.ProfessionalManagement.Contracts.Services;

// Интерфейс фасада ProfessionalManagement
public interface IProfessionalManagementService
{
    Task<IReadOnlyCollection<ExperienceDto>> GetMyExperiencesAsync(string userId);

    Task<ExperienceDto?> GetMyExperienceByIdAsync(string userId, Guid experienceId);

    Task<ExperienceResponse> CreateMyExperienceAsync(
        string userId,
        CreateExperienceRequest request);

    Task<ExperienceResponse> UpdateMyExperienceAsync(
        string userId,
        Guid experienceId,
        UpdateExperienceRequest request);

    Task<ExperienceResponse> PatchMyExperienceAsync(
        string userId,
        Guid experienceId,
        PatchExperienceRequest request);

    Task<ExperienceResponse> DeleteMyExperienceAsync(
        string userId,
        Guid experienceId);
}