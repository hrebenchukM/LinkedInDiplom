using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Academy;
using Facade.ProfessionalManagement.Contracts.Requests.Certificate;
using Facade.ProfessionalManagement.Contracts.Requests.Company;
using Facade.ProfessionalManagement.Contracts.Requests.Education;
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
}