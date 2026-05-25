using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Academy;
using Facade.ProfessionalManagement.Contracts.Requests.Certificate;
using Facade.ProfessionalManagement.Contracts.Requests.Company;
using Facade.ProfessionalManagement.Contracts.Requests.Education;
using Facade.ProfessionalManagement.Contracts.Requests.Experience;
using Facade.ProfessionalManagement.Contracts.Requests.CertificateSkill;
using Facade.ProfessionalManagement.Contracts.Requests.Language;
using Facade.ProfessionalManagement.Contracts.Requests.Skill;
using Facade.ProfessionalManagement.Contracts.Requests.UserLanguage;
using Facade.ProfessionalManagement.Contracts.Requests.Recommendation;
using Facade.ProfessionalManagement.Contracts.Requests.RecommendedSkillByPosition;
using Facade.ProfessionalManagement.Contracts.Requests.UserSkill;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Professional.Client.Contracts;
using Professional.Contracts.Parameters.Academy;
using Professional.Contracts.Parameters.Certificate;
using Professional.Contracts.Parameters.Company;
using Professional.Contracts.Parameters.Education;
using Professional.Contracts.Parameters.Experience;
using Professional.Contracts.Parameters.CertificateSkill;
using Professional.Contracts.Parameters.Language;
using Professional.Contracts.Parameters.Skill;
using Professional.Contracts.Parameters.UserLanguage;
using Professional.Contracts.Parameters.Recommendation;
using Professional.Contracts.Parameters.RecommendedSkillByPosition;
using Professional.Contracts.Parameters.UserSkill;

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

    // Получить все мои сертификаты
    public async Task<IReadOnlyCollection<CertificateDto>> GetMyCertificatesAsync(string userId)
    {
        var certificates = await _professionalClient.Certificates.GetUserCertificatesAsync(
            new GetUserCertificatesParameters
            {
                UserId = userId
            });

        return certificates
            .Select(MapToFacadeDto)
            .ToList();
    }

    // Получить один мой сертификат по Id
    public async Task<CertificateDto?> GetMyCertificateByIdAsync(string userId, Guid certificateId)
    {
        var certificate = await _professionalClient.Certificates.GetByIdAsync(
            new GetCertificateByIdParameters
            {
                UserId = userId,
                CertificateId = certificateId
            });

        return certificate == null ? null : MapToFacadeDto(certificate);
    }

    // Создать сертификат
    public async Task<CertificateResponse> CreateMyCertificateAsync(
        string userId,
        CreateCertificateRequest request)
    {
        var result = await _professionalClient.Certificates.CreateAsync(
            new CreateCertificateParameters
            {
                UserId = userId,
                AcademyId = request.AcademyId,
                Name = request.Name,
                DownloadRef = request.DownloadRef,
                IssueDate = request.IssueDate,
                ExpiryDate = request.ExpiryDate,
                AccreditationId = request.AccreditationId,
                OrganizationUrl = request.OrganizationUrl
            });

        return new CertificateResponse
        {
            Success = result.Succeeded,
            Certificate = result.Certificate == null ? null : MapToFacadeDto(result.Certificate),
            Errors = result.Errors
        };
    }

    // Полностью обновить сертификат
    public async Task<CertificateResponse> UpdateMyCertificateAsync(
        string userId,
        Guid certificateId,
        UpdateCertificateRequest request)
    {
        var result = await _professionalClient.Certificates.UpdateAsync(
            new UpdateCertificateParameters
            {
                UserId = userId,
                CertificateId = certificateId,
                AcademyId = request.AcademyId,
                Name = request.Name,
                DownloadRef = request.DownloadRef,
                IssueDate = request.IssueDate,
                ExpiryDate = request.ExpiryDate,
                AccreditationId = request.AccreditationId,
                OrganizationUrl = request.OrganizationUrl
            });

        return new CertificateResponse
        {
            Success = result.Succeeded,
            Certificate = result.Certificate == null ? null : MapToFacadeDto(result.Certificate),
            Errors = result.Errors
        };
    }

    // Частично обновить сертификат
    public async Task<CertificateResponse> PatchMyCertificateAsync(
        string userId,
        Guid certificateId,
        PatchCertificateRequest request)
    {
        var result = await _professionalClient.Certificates.PatchAsync(
            new PatchCertificateParameters
            {
                UserId = userId,
                CertificateId = certificateId,
                AcademyId = request.AcademyId,
                Name = request.Name,
                DownloadRef = request.DownloadRef,
                IssueDate = request.IssueDate,
                ExpiryDate = request.ExpiryDate,
                AccreditationId = request.AccreditationId,
                OrganizationUrl = request.OrganizationUrl
            });

        return new CertificateResponse
        {
            Success = result.Succeeded,
            Certificate = result.Certificate == null ? null : MapToFacadeDto(result.Certificate),
            Errors = result.Errors
        };
    }

    // Удалить сертификат
    public async Task<CertificateResponse> DeleteMyCertificateAsync(
        string userId,
        Guid certificateId)
    {
        var result = await _professionalClient.Certificates.DeleteAsync(
            new DeleteCertificateParameters
            {
                UserId = userId,
                CertificateId = certificateId
            });

        return new CertificateResponse
        {
            Success = result.Succeeded,
            Certificate = result.Certificate == null ? null : MapToFacadeDto(result.Certificate),
            Errors = result.Errors
        };
    }

    private static CertificateDto MapToFacadeDto(Professional.Contracts.DTOs.CertificateDto certificate)
    {
        return new CertificateDto
        {
            Id = certificate.Id,
            UserId = certificate.UserId,
            AcademyId = certificate.AcademyId,
            Name = certificate.Name,
            DownloadRef = certificate.DownloadRef,
            IssueDate = certificate.IssueDate,
            ExpiryDate = certificate.ExpiryDate,
            AccreditationId = certificate.AccreditationId,
            OrganizationUrl = certificate.OrganizationUrl,
            CreatedAt = certificate.CreatedAt,
            UpdatedAt = certificate.UpdatedAt
        };
    }

    // Получить навык в справочнике по Id
    public async Task<SkillDto?> GetSkillByIdAsync(Guid skillId)
    {
        var skill = await _professionalClient.Skills.GetByIdAsync(
            new GetSkillByIdParameters
            {
                SkillId = skillId
            });

        return skill == null ? null : MapToFacadeDto(skill);
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
            Skill = result.Skill == null ? null : MapToFacadeDto(result.Skill),
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
            .Select(MapToFacadeDto)
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

        return userSkill == null ? null : MapToFacadeDto(userSkill);
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
            UserSkill = result.UserSkill == null ? null : MapToFacadeDto(result.UserSkill),
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
            UserSkill = result.UserSkill == null ? null : MapToFacadeDto(result.UserSkill),
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
            UserSkill = result.UserSkill == null ? null : MapToFacadeDto(result.UserSkill),
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
            UserSkill = result.UserSkill == null ? null : MapToFacadeDto(result.UserSkill),
            Errors = result.Errors
        };
    }

    private static SkillDto MapToFacadeDto(Professional.Contracts.DTOs.SkillDto skill)
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

    private static UserSkillDto MapToFacadeDto(Professional.Contracts.DTOs.UserSkillDto userSkill)
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

    // Получить язык в справочнике по Id
    public async Task<LanguageDto?> GetLanguageByIdAsync(Guid languageId)
    {
        var language = await _professionalClient.Languages.GetByIdAsync(
            new GetLanguageByIdParameters
            {
                LanguageId = languageId
            });

        return language == null ? null : MapToFacadeDto(language);
    }

    // Создать язык в справочнике
    public async Task<LanguageResponse> CreateLanguageAsync(CreateLanguageRequest request)
    {
        var result = await _professionalClient.Languages.CreateAsync(
            new CreateLanguageParameters
            {
                Name = request.Name
            });

        return new LanguageResponse
        {
            Success = result.Succeeded,
            Language = result.Language == null ? null : MapToFacadeDto(result.Language),
            Errors = result.Errors
        };
    }

    // Получить все мои языки
    public async Task<IReadOnlyCollection<UserLanguageDto>> GetMyUserLanguagesAsync(string userId)
    {
        var userLanguages = await _professionalClient.UserLanguages.GetUserLanguagesAsync(
            new GetUserLanguagesParameters
            {
                UserId = userId
            });

        return userLanguages
            .Select(MapToFacadeDto)
            .ToList();
    }

    // Получить один мой язык по Id
    public async Task<UserLanguageDto?> GetMyUserLanguageByIdAsync(string userId, Guid userLanguageId)
    {
        var userLanguage = await _professionalClient.UserLanguages.GetByIdAsync(
            new GetUserLanguageByIdParameters
            {
                UserId = userId,
                UserLanguageId = userLanguageId
            });

        return userLanguage == null ? null : MapToFacadeDto(userLanguage);
    }

    // Добавить язык текущему пользователю
    public async Task<UserLanguageResponse> CreateMyUserLanguageAsync(
        string userId,
        CreateUserLanguageRequest request)
    {
        var result = await _professionalClient.UserLanguages.CreateAsync(
            new CreateUserLanguageParameters
            {
                UserId = userId,
                LanguageId = request.LanguageId,
                Level = request.Level
            });

        return new UserLanguageResponse
        {
            Success = result.Succeeded,
            UserLanguage = result.UserLanguage == null ? null : MapToFacadeDto(result.UserLanguage),
            Errors = result.Errors
        };
    }

    // Полностью обновить язык пользователя
    public async Task<UserLanguageResponse> UpdateMyUserLanguageAsync(
        string userId,
        Guid userLanguageId,
        UpdateUserLanguageRequest request)
    {
        var result = await _professionalClient.UserLanguages.UpdateAsync(
            new UpdateUserLanguageParameters
            {
                UserId = userId,
                UserLanguageId = userLanguageId,
                LanguageId = request.LanguageId,
                Level = request.Level
            });

        return new UserLanguageResponse
        {
            Success = result.Succeeded,
            UserLanguage = result.UserLanguage == null ? null : MapToFacadeDto(result.UserLanguage),
            Errors = result.Errors
        };
    }

    // Частично обновить язык пользователя
    public async Task<UserLanguageResponse> PatchMyUserLanguageAsync(
        string userId,
        Guid userLanguageId,
        PatchUserLanguageRequest request)
    {
        var result = await _professionalClient.UserLanguages.PatchAsync(
            new PatchUserLanguageParameters
            {
                UserId = userId,
                UserLanguageId = userLanguageId,
                LanguageId = request.LanguageId,
                Level = request.Level
            });

        return new UserLanguageResponse
        {
            Success = result.Succeeded,
            UserLanguage = result.UserLanguage == null ? null : MapToFacadeDto(result.UserLanguage),
            Errors = result.Errors
        };
    }

    // Удалить язык пользователя
    public async Task<UserLanguageResponse> DeleteMyUserLanguageAsync(
        string userId,
        Guid userLanguageId)
    {
        var result = await _professionalClient.UserLanguages.DeleteAsync(
            new DeleteUserLanguageParameters
            {
                UserId = userId,
                UserLanguageId = userLanguageId
            });

        return new UserLanguageResponse
        {
            Success = result.Succeeded,
            UserLanguage = result.UserLanguage == null ? null : MapToFacadeDto(result.UserLanguage),
            Errors = result.Errors
        };
    }

    private static LanguageDto MapToFacadeDto(Professional.Contracts.DTOs.LanguageDto language)
    {
        return new LanguageDto
        {
            Id = language.Id,
            Name = language.Name,
            CreatedAt = language.CreatedAt
        };
    }

    private static UserLanguageDto MapToFacadeDto(Professional.Contracts.DTOs.UserLanguageDto userLanguage)
    {
        return new UserLanguageDto
        {
            Id = userLanguage.Id,
            UserId = userLanguage.UserId,
            LanguageId = userLanguage.LanguageId,
            Level = userLanguage.Level,
            CreatedAt = userLanguage.CreatedAt,
            UpdatedAt = userLanguage.UpdatedAt
        };
    }

    // Получить навыки сертификата
    public async Task<IReadOnlyCollection<CertificateSkillDto>?> GetMyCertificateSkillsAsync(
        string userId,
        Guid certificateId)
    {
        var certificate = await GetMyCertificateByIdAsync(userId, certificateId);

        if (certificate == null)
            return null;

        var certificateSkills = await _professionalClient.CertificateSkills.GetCertificateSkillsAsync(
            new GetCertificateSkillsParameters
            {
                UserId = userId,
                CertificateId = certificateId
            });

        return certificateSkills
            .Select(MapToFacadeDto)
            .ToList();
    }

    // Получить одну связку сертификата и навыка
    public async Task<CertificateSkillDto?> GetMyCertificateSkillByIdAsync(
        string userId,
        Guid certificateId,
        Guid certificateSkillId)
    {
        var certificate = await GetMyCertificateByIdAsync(userId, certificateId);

        if (certificate == null)
            return null;

        var certificateSkill = await _professionalClient.CertificateSkills.GetByIdAsync(
            new GetCertificateSkillByIdParameters
            {
                UserId = userId,
                CertificateId = certificateId,
                CertificateSkillId = certificateSkillId
            });

        return certificateSkill == null ? null : MapToFacadeDto(certificateSkill);
    }

    // Добавить навык к сертификату
    public async Task<CertificateSkillResponse> CreateMyCertificateSkillAsync(
        string userId,
        Guid certificateId,
        CreateCertificateSkillRequest request)
    {
        var result = await _professionalClient.CertificateSkills.CreateAsync(
            new CreateCertificateSkillParameters
            {
                UserId = userId,
                CertificateId = certificateId,
                SkillId = request.SkillId
            });

        return new CertificateSkillResponse
        {
            Success = result.Succeeded,
            CertificateSkill = result.CertificateSkill == null
                ? null
                : MapToFacadeDto(result.CertificateSkill),
            Errors = result.Errors
        };
    }

    // Удалить связку сертификата и навыка
    public async Task<CertificateSkillResponse> DeleteMyCertificateSkillAsync(
        string userId,
        Guid certificateId,
        Guid certificateSkillId)
    {
        var result = await _professionalClient.CertificateSkills.DeleteAsync(
            new DeleteCertificateSkillParameters
            {
                UserId = userId,
                CertificateId = certificateId,
                CertificateSkillId = certificateSkillId
            });

        return new CertificateSkillResponse
        {
            Success = result.Succeeded,
            CertificateSkill = result.CertificateSkill == null
                ? null
                : MapToFacadeDto(result.CertificateSkill),
            Errors = result.Errors
        };
    }

    private static CertificateSkillDto MapToFacadeDto(
        Professional.Contracts.DTOs.CertificateSkillDto certificateSkill)
    {
        return new CertificateSkillDto
        {
            Id = certificateSkill.Id,
            CertificateId = certificateSkill.CertificateId,
            SkillId = certificateSkill.SkillId,
            CreatedAt = certificateSkill.CreatedAt
        };
    }

    // Получить рекомендованные навыки для должности
    public async Task<IReadOnlyCollection<RecommendedSkillByPositionDto>> GetRecommendedSkillsByPositionAsync(
        string position)
    {
        var items = await _professionalClient.RecommendedSkillsByPosition.GetRecommendedSkillsByPositionAsync(
            new GetRecommendedSkillsByPositionParameters
            {
                Position = position
            });

        return items
            .Select(MapToFacadeDto)
            .ToList();
    }

    // Добавить рекомендованный навык к должности
    public async Task<RecommendedSkillByPositionResponse> CreateRecommendedSkillByPositionAsync(
        CreateRecommendedSkillByPositionRequest request)
    {
        var result = await _professionalClient.RecommendedSkillsByPosition.CreateAsync(
            new CreateRecommendedSkillByPositionParameters
            {
                Position = request.Position,
                SkillId = request.SkillId
            });

        return new RecommendedSkillByPositionResponse
        {
            Success = result.Succeeded,
            RecommendedSkillByPosition = result.RecommendedSkillByPosition == null
                ? null
                : MapToFacadeDto(result.RecommendedSkillByPosition),
            Errors = result.Errors
        };
    }

    // Удалить рекомендованный навык для должности
    public async Task<RecommendedSkillByPositionResponse> DeleteRecommendedSkillByPositionAsync(Guid rspId)
    {
        var result = await _professionalClient.RecommendedSkillsByPosition.DeleteAsync(
            new DeleteRecommendedSkillByPositionParameters
            {
                RspId = rspId
            });

        return new RecommendedSkillByPositionResponse
        {
            Success = result.Succeeded,
            RecommendedSkillByPosition = result.RecommendedSkillByPosition == null
                ? null
                : MapToFacadeDto(result.RecommendedSkillByPosition),
            Errors = result.Errors
        };
    }

    private static RecommendedSkillByPositionDto MapToFacadeDto(
        Professional.Contracts.DTOs.RecommendedSkillByPositionDto recommendedSkill)
    {
        return new RecommendedSkillByPositionDto
        {
            Id = recommendedSkill.Id,
            Position = recommendedSkill.Position,
            SkillId = recommendedSkill.SkillId,
            CreatedAt = recommendedSkill.CreatedAt,
            UpdatedAt = recommendedSkill.UpdatedAt
        };
    }

    // Получить рекомендации для получателя (публичный список)
    public async Task<IReadOnlyCollection<RecommendationDto>> GetRecommendationsForUserAsync(string userId)
    {
        var recommendations = await _professionalClient.Recommendations.GetRecommendationsForUserAsync(
            new GetRecommendationsForUserParameters
            {
                UserId = userId
            });

        return recommendations
            .Select(MapToFacadeDto)
            .ToList();
    }

    // Получить одну рекомендацию по Id (публичный)
    public async Task<RecommendationDto?> GetRecommendationByIdAsync(Guid recommendationId)
    {
        var recommendation = await _professionalClient.Recommendations.GetByIdAsync(
            new GetRecommendationByIdParameters
            {
                RecommendationId = recommendationId
            });

        return recommendation == null ? null : MapToFacadeDto(recommendation);
    }

    // Создать рекомендацию (authorId из JWT)
    public async Task<RecommendationResponse> CreateRecommendationAsync(
        string authorId,
        CreateRecommendationRequest request)
    {
        var result = await _professionalClient.Recommendations.CreateAsync(
            new CreateRecommendationParameters
            {
                AuthorId = authorId,
                UserId = request.UserId,
                Text = request.Text
            });

        return new RecommendationResponse
        {
            Success = result.Succeeded,
            Recommendation = result.Recommendation == null
                ? null
                : MapToFacadeDto(result.Recommendation),
            Errors = result.Errors
        };
    }

    // Обновить текст рекомендации (только автор)
    public async Task<RecommendationResponse> PatchRecommendationAsync(
        string authorId,
        Guid recommendationId,
        PatchRecommendationRequest request)
    {
        var result = await _professionalClient.Recommendations.PatchAsync(
            new PatchRecommendationParameters
            {
                AuthorId = authorId,
                RecommendationId = recommendationId,
                Text = request.Text
            });

        return new RecommendationResponse
        {
            Success = result.Succeeded,
            Recommendation = result.Recommendation == null
                ? null
                : MapToFacadeDto(result.Recommendation),
            Errors = result.Errors
        };
    }

    // Soft delete рекомендации (только автор)
    public async Task<RecommendationResponse> DeleteRecommendationAsync(
        string authorId,
        Guid recommendationId)
    {
        var result = await _professionalClient.Recommendations.DeleteAsync(
            new DeleteRecommendationParameters
            {
                AuthorId = authorId,
                RecommendationId = recommendationId
            });

        return new RecommendationResponse
        {
            Success = result.Succeeded,
            Recommendation = result.Recommendation == null
                ? null
                : MapToFacadeDto(result.Recommendation),
            Errors = result.Errors
        };
    }

    private static RecommendationDto MapToFacadeDto(
        Professional.Contracts.DTOs.RecommendationDto recommendation)
    {
        return new RecommendationDto
        {
            Id = recommendation.Id,
            AuthorId = recommendation.AuthorId,
            UserId = recommendation.UserId,
            Text = recommendation.Text,
            CreatedAt = recommendation.CreatedAt,
            UpdatedAt = recommendation.UpdatedAt
        };
    }
}