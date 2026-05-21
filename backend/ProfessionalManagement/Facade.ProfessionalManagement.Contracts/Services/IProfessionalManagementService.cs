using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Company;
using Facade.ProfessionalManagement.Contracts.Requests.Experience;
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

    // Получить мои компании
    Task<IReadOnlyCollection<CompanyDto>> GetMyCompaniesAsync(string userId);

    // Получить компанию по Id
    Task<CompanyDto?> GetCompanyByIdAsync(Guid companyId);

    // Создать мою компанию
    Task<CompanyResponse> CreateMyCompanyAsync(
        string userId,
        CreateCompanyRequest request);

    // Полностью обновить мою компанию
    Task<CompanyResponse> UpdateMyCompanyAsync(
        string userId,
        Guid companyId,
        UpdateCompanyRequest request);

    // Частично обновить мою компанию
    Task<CompanyResponse> PatchMyCompanyAsync(
        string userId,
        Guid companyId,
        PatchCompanyRequest request);

    // Удалить мою компанию
    Task<CompanyResponse> DeleteMyCompanyAsync(
        string userId,
        Guid companyId);
}