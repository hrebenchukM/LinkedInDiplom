using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Academy;
using Facade.ProfessionalManagement.Contracts.Requests.Company;
using Facade.ProfessionalManagement.Contracts.Requests.Education;
using Facade.ProfessionalManagement.Contracts.Requests.Experience;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Professional.Client.Contracts;
using Professional.Contracts.Parameters.Academy;
using Professional.Contracts.Parameters.Company;
using Professional.Contracts.Parameters.Education;
using Professional.Contracts.Parameters.Experience;

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

    // Получить мои компании
    public async Task<IReadOnlyCollection<CompanyDto>> GetMyCompaniesAsync(string userId)
    {
        var companies = await _professionalClient.Companies.GetMyCompaniesAsync(
            new GetUserCompaniesParameters
            {
                UserId = userId
            });

        return companies
            .Select(MapToFacadeDto)
            .ToList();
    }

    // Получить компанию по Id
    public async Task<CompanyDto?> GetCompanyByIdAsync(Guid companyId)
    {
        var company = await _professionalClient.Companies.GetByIdAsync(
            new GetCompanyByIdParameters
            {
                CompanyId = companyId
            });

        return company == null ? null : MapToFacadeDto(company);
    }

    // Создать мою компанию
    public async Task<CompanyResponse> CreateMyCompanyAsync(
        string userId,
        CreateCompanyRequest request)
    {
        var result = await _professionalClient.Companies.CreateAsync(
            new CreateCompanyParameters
            {
                OwnerUserId = userId,
                Name = request.Name,
                LogoUrl = request.LogoUrl,
                Industry = request.Industry,
                Location = request.Location,
                WebsiteUrl = request.WebsiteUrl,
                Description = request.Description
            });

        return new CompanyResponse
        {
            Success = result.Succeeded,
            Company = result.Company == null ? null : MapToFacadeDto(result.Company),
            Errors = result.Errors
        };
    }

    // Полностью обновить мою компанию
    public async Task<CompanyResponse> UpdateMyCompanyAsync(
        string userId,
        Guid companyId,
        UpdateCompanyRequest request)
    {
        var result = await _professionalClient.Companies.UpdateAsync(
            new UpdateCompanyParameters
            {
                UserId = userId,
                CompanyId = companyId,
                Name = request.Name,
                LogoUrl = request.LogoUrl,
                Industry = request.Industry,
                Location = request.Location,
                WebsiteUrl = request.WebsiteUrl,
                Description = request.Description
            });

        return new CompanyResponse
        {
            Success = result.Succeeded,
            Company = result.Company == null ? null : MapToFacadeDto(result.Company),
            Errors = result.Errors
        };
    }

    // Частично обновить мою компанию
    public async Task<CompanyResponse> PatchMyCompanyAsync(
        string userId,
        Guid companyId,
        PatchCompanyRequest request)
    {
        var result = await _professionalClient.Companies.PatchAsync(
            new PatchCompanyParameters
            {
                UserId = userId,
                CompanyId = companyId,
                Name = request.Name,
                LogoUrl = request.LogoUrl,
                Industry = request.Industry,
                Location = request.Location,
                WebsiteUrl = request.WebsiteUrl,
                Description = request.Description
            });

        return new CompanyResponse
        {
            Success = result.Succeeded,
            Company = result.Company == null ? null : MapToFacadeDto(result.Company),
            Errors = result.Errors
        };
    }

    // Удалить мою компанию
    public async Task<CompanyResponse> DeleteMyCompanyAsync(
        string userId,
        Guid companyId)
    {
        var result = await _professionalClient.Companies.DeleteAsync(
            new DeleteCompanyParameters
            {
                UserId = userId,
                CompanyId = companyId
            });

        return new CompanyResponse
        {
            Success = result.Succeeded,
            Company = result.Company == null ? null : MapToFacadeDto(result.Company),
            Errors = result.Errors
        };
    }
    private static CompanyDto MapToFacadeDto(Professional.Contracts.DTOs.CompanyDto company)
    {
        return new CompanyDto
        {
            Id = company.Id,
            OwnerUserId = company.OwnerUserId,
            Name = company.Name,
            LogoUrl = company.LogoUrl,
            Industry = company.Industry,
            Location = company.Location,
            WebsiteUrl = company.WebsiteUrl,
            Description = company.Description,
            CreatedAt = company.CreatedAt,
            UpdatedAt = company.UpdatedAt
        };
    }

    // Получить учебное заведение по Id
    public async Task<AcademyDto?> GetAcademyByIdAsync(Guid academyId)
    {
        var academy = await _professionalClient.Academies.GetByIdAsync(
            new GetAcademyByIdParameters
            {
                AcademyId = academyId
            });

        return academy == null ? null : MapToFacadeDto(academy);
    }

    // Создать учебное заведение
    public async Task<AcademyResponse> CreateAcademyAsync(CreateAcademyRequest request)
    {
        var result = await _professionalClient.Academies.CreateAsync(
            new CreateAcademyParameters
            {
                Name = request.Name,
                LogoUrl = request.LogoUrl,
                WebsiteUrl = request.WebsiteUrl
            });

        return new AcademyResponse
        {
            Success = result.Succeeded,
            Academy = result.Academy == null ? null : MapToFacadeDto(result.Academy),
            Errors = result.Errors
        };
    }

    // Получить всё моё образование
    public async Task<IReadOnlyCollection<EducationDto>> GetMyEducationsAsync(string userId)
    {
        var educations = await _professionalClient.Educations.GetUserEducationsAsync(
            new GetUserEducationsParameters
            {
                UserId = userId
            });

        return educations
            .Select(MapToFacadeDto)
            .ToList();
    }

    // Получить одну запись об образовании по Id
    public async Task<EducationDto?> GetMyEducationByIdAsync(string userId, Guid educationId)
    {
        var education = await _professionalClient.Educations.GetByIdAsync(
            new GetEducationByIdParameters
            {
                UserId = userId,
                EducationId = educationId
            });

        return education == null ? null : MapToFacadeDto(education);
    }

    // Создать запись об образовании
    public async Task<EducationResponse> CreateMyEducationAsync(
        string userId,
        CreateEducationRequest request)
    {
        var result = await _professionalClient.Educations.CreateAsync(
            new CreateEducationParameters
            {
                UserId = userId,
                AcademyId = request.AcademyId,
                Institution = request.Institution,
                Degree = request.Degree,
                FieldOfStudy = request.FieldOfStudy,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Source = request.Source
            });

        return new EducationResponse
        {
            Success = result.Succeeded,
            Education = result.Education == null ? null : MapToFacadeDto(result.Education),
            Errors = result.Errors
        };
    }

    // Полностью обновить запись об образовании
    public async Task<EducationResponse> UpdateMyEducationAsync(
        string userId,
        Guid educationId,
        UpdateEducationRequest request)
    {
        var result = await _professionalClient.Educations.UpdateAsync(
            new UpdateEducationParameters
            {
                UserId = userId,
                EducationId = educationId,
                AcademyId = request.AcademyId,
                Institution = request.Institution,
                Degree = request.Degree,
                FieldOfStudy = request.FieldOfStudy,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Source = request.Source
            });

        return new EducationResponse
        {
            Success = result.Succeeded,
            Education = result.Education == null ? null : MapToFacadeDto(result.Education),
            Errors = result.Errors
        };
    }

    // Частично обновить запись об образовании
    public async Task<EducationResponse> PatchMyEducationAsync(
        string userId,
        Guid educationId,
        PatchEducationRequest request)
    {
        var result = await _professionalClient.Educations.PatchAsync(
            new PatchEducationParameters
            {
                UserId = userId,
                EducationId = educationId,
                AcademyId = request.AcademyId,
                Institution = request.Institution,
                Degree = request.Degree,
                FieldOfStudy = request.FieldOfStudy,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Source = request.Source
            });

        return new EducationResponse
        {
            Success = result.Succeeded,
            Education = result.Education == null ? null : MapToFacadeDto(result.Education),
            Errors = result.Errors
        };
    }

    // Удалить запись об образовании
    public async Task<EducationResponse> DeleteMyEducationAsync(
        string userId,
        Guid educationId)
    {
        var result = await _professionalClient.Educations.DeleteAsync(
            new DeleteEducationParameters
            {
                UserId = userId,
                EducationId = educationId
            });

        return new EducationResponse
        {
            Success = result.Succeeded,
            Education = result.Education == null ? null : MapToFacadeDto(result.Education),
            Errors = result.Errors
        };
    }

    private static AcademyDto MapToFacadeDto(Professional.Contracts.DTOs.AcademyDto academy)
    {
        return new AcademyDto
        {
            Id = academy.Id,
            Name = academy.Name,
            LogoUrl = academy.LogoUrl,
            WebsiteUrl = academy.WebsiteUrl,
            CreatedAt = academy.CreatedAt,
            UpdatedAt = academy.UpdatedAt
        };
    }

    private static EducationDto MapToFacadeDto(Professional.Contracts.DTOs.EducationDto education)
    {
        return new EducationDto
        {
            Id = education.Id,
            UserId = education.UserId,
            AcademyId = education.AcademyId,
            Institution = education.Institution,
            Degree = education.Degree,
            FieldOfStudy = education.FieldOfStudy,
            StartDate = education.StartDate,
            EndDate = education.EndDate,
            Source = education.Source,
            CreatedAt = education.CreatedAt,
            UpdatedAt = education.UpdatedAt
        };
    }
}