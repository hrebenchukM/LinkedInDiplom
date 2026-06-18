using Facade.ProfessionalManagement.Contracts.DTOs;
using Profile.Contracts.Parameters;
using Professional.Contracts.Parameters.Certificate;
using Professional.Contracts.Parameters.Education;
using Professional.Contracts.Parameters.Experience;
using Professional.Contracts.Parameters.UserLanguage;
using Professional.Contracts.Parameters.UserSkill;

namespace Facade.ProfessionalManagement.Services.Services;

public partial class ProfessionalManagementService
{
    public async Task<IReadOnlyCollection<ExperienceDto>?> GetUserExperiencesAsync(string userId)
    {
        if (!await UserProfileExistsAsync(userId))
        {
            return null;
        }

        var experiences = await _professionalClient.Experiences.GetUserExperiencesAsync(
            new GetUserExperiencesParameters
            {
                UserId = userId
            });

        return experiences
            .Select(MapExperienceToFacadeDto)
            .ToList();
    }

    public async Task<IReadOnlyCollection<EducationDto>?> GetUserEducationsAsync(string userId)
    {
        if (!await UserProfileExistsAsync(userId))
        {
            return null;
        }

        var educations = await _professionalClient.Educations.GetUserEducationsAsync(
            new GetUserEducationsParameters
            {
                UserId = userId
            });

        return educations
            .Select(MapEducationToFacadeDto)
            .ToList();
    }

    public async Task<IReadOnlyCollection<UserSkillDto>?> GetUserSkillsAsync(string userId)
    {
        if (!await UserProfileExistsAsync(userId))
        {
            return null;
        }

        var userSkills = await _professionalClient.UserSkills.GetUserSkillsAsync(
            new GetUserSkillsParameters
            {
                UserId = userId
            });

        return userSkills
            .Select(MapUserSkillToFacadeDto)
            .ToList();
    }

    public async Task<IReadOnlyCollection<CertificateDto>?> GetUserCertificatesAsync(string userId)
    {
        if (!await UserProfileExistsAsync(userId))
        {
            return null;
        }

        var certificates = await _professionalClient.Certificates.GetUserCertificatesAsync(
            new GetUserCertificatesParameters
            {
                UserId = userId
            });

        return certificates
            .Select(MapCertificateToFacadeDto)
            .ToList();
    }

    public async Task<IReadOnlyCollection<UserLanguageDto>?> GetUserLanguagesAsync(string userId)
    {
        if (!await UserProfileExistsAsync(userId))
        {
            return null;
        }

        var userLanguages = await _professionalClient.UserLanguages.GetUserLanguagesAsync(
            new GetUserLanguagesParameters
            {
                UserId = userId
            });

        return userLanguages
            .Select(MapUserLanguageToFacadeDto)
            .ToList();
    }

    private async Task<bool> UserProfileExistsAsync(string userId)
    {
        var profile = await _profileClient.Profiles.GetAsync(new GetProfileByUserIdParameters
        {
            UserId = userId
        });

        return profile != null;
    }
}
