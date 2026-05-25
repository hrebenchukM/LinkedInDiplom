using Professional.Client.Contracts.Resources;

namespace Professional.Client.Contracts;

// Внутренний клиент Professional-модуля.
// По аналогии с IdentityClient и ProfileClient.
public interface IProfessionalClient
{
    IExperienceResource Experiences { get; }

    ICompanyResource Companies { get; }

    IAcademyResource Academies { get; }

    IEducationResource Educations { get; }

    ICertificateResource Certificates { get; }

    ISkillResource Skills { get; }

    IUserSkillResource UserSkills { get; }

    ILanguageResource Languages { get; }

    IUserLanguageResource UserLanguages { get; }
}