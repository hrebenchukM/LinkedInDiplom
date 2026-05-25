using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Academy;
using Facade.ProfessionalManagement.Contracts.Requests.Certificate;
using Facade.ProfessionalManagement.Contracts.Requests.Company;
using Facade.ProfessionalManagement.Contracts.Requests.Education;
using Facade.ProfessionalManagement.Contracts.Requests.Experience;
using Facade.ProfessionalManagement.Contracts.Requests.Language;
using Facade.ProfessionalManagement.Contracts.Requests.Skill;
using Facade.ProfessionalManagement.Contracts.Requests.UserLanguage;
using Facade.ProfessionalManagement.Contracts.Requests.UserSkill;
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

    Task<AcademyDto?> GetAcademyByIdAsync(Guid academyId);

    Task<AcademyResponse> CreateAcademyAsync(CreateAcademyRequest request);

    Task<IReadOnlyCollection<EducationDto>> GetMyEducationsAsync(string userId);

    Task<EducationDto?> GetMyEducationByIdAsync(string userId, Guid educationId);

    Task<EducationResponse> CreateMyEducationAsync(
        string userId,
        CreateEducationRequest request);

    Task<EducationResponse> UpdateMyEducationAsync(
        string userId,
        Guid educationId,
        UpdateEducationRequest request);

    Task<EducationResponse> PatchMyEducationAsync(
        string userId,
        Guid educationId,
        PatchEducationRequest request);

    Task<EducationResponse> DeleteMyEducationAsync(
        string userId,
        Guid educationId);

    Task<IReadOnlyCollection<CertificateDto>> GetMyCertificatesAsync(string userId);

    Task<CertificateDto?> GetMyCertificateByIdAsync(string userId, Guid certificateId);

    Task<CertificateResponse> CreateMyCertificateAsync(
        string userId,
        CreateCertificateRequest request);

    Task<CertificateResponse> UpdateMyCertificateAsync(
        string userId,
        Guid certificateId,
        UpdateCertificateRequest request);

    Task<CertificateResponse> PatchMyCertificateAsync(
        string userId,
        Guid certificateId,
        PatchCertificateRequest request);

    Task<CertificateResponse> DeleteMyCertificateAsync(
        string userId,
        Guid certificateId);

    Task<SkillDto?> GetSkillByIdAsync(Guid skillId);

    Task<SkillResponse> CreateSkillAsync(CreateSkillRequest request);

    Task<IReadOnlyCollection<UserSkillDto>> GetMyUserSkillsAsync(string userId);

    Task<UserSkillDto?> GetMyUserSkillByIdAsync(string userId, Guid userSkillId);

    Task<UserSkillResponse> CreateMyUserSkillAsync(
        string userId,
        CreateUserSkillRequest request);

    Task<UserSkillResponse> UpdateMyUserSkillAsync(
        string userId,
        Guid userSkillId,
        UpdateUserSkillRequest request);

    Task<UserSkillResponse> PatchMyUserSkillAsync(
        string userId,
        Guid userSkillId,
        PatchUserSkillRequest request);

    Task<UserSkillResponse> DeleteMyUserSkillAsync(
        string userId,
        Guid userSkillId);

    Task<LanguageDto?> GetLanguageByIdAsync(Guid languageId);

    Task<LanguageResponse> CreateLanguageAsync(CreateLanguageRequest request);

    Task<IReadOnlyCollection<UserLanguageDto>> GetMyUserLanguagesAsync(string userId);

    Task<UserLanguageDto?> GetMyUserLanguageByIdAsync(string userId, Guid userLanguageId);

    Task<UserLanguageResponse> CreateMyUserLanguageAsync(
        string userId,
        CreateUserLanguageRequest request);

    Task<UserLanguageResponse> UpdateMyUserLanguageAsync(
        string userId,
        Guid userLanguageId,
        UpdateUserLanguageRequest request);

    Task<UserLanguageResponse> PatchMyUserLanguageAsync(
        string userId,
        Guid userLanguageId,
        PatchUserLanguageRequest request);

    Task<UserLanguageResponse> DeleteMyUserLanguageAsync(
        string userId,
        Guid userLanguageId);
}