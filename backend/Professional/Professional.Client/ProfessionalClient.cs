using Professional.Client.Contracts;
using Professional.Client.Contracts.Resources;

namespace Professional.Client;

// Внутренний клиент Professional-модуля.
public class ProfessionalClient : IProfessionalClient
{
    public IExperienceResource Experiences { get; }

    public ICompanyResource Companies { get; }

    public IAcademyResource Academies { get; }

    public IEducationResource Educations { get; }

    public ICertificateResource Certificates { get; }

    public ISkillResource Skills { get; }

    public IUserSkillResource UserSkills { get; }

    public ILanguageResource Languages { get; }

    public IUserLanguageResource UserLanguages { get; }

    public ICertificateSkillResource CertificateSkills { get; }

    public ProfessionalClient(
        IExperienceResource experiences,
        ICompanyResource companies,
        IAcademyResource academies,
        IEducationResource educations,
        ICertificateResource certificates,
        ISkillResource skills,
        IUserSkillResource userSkills,
        ILanguageResource languages,
        IUserLanguageResource userLanguages,
        ICertificateSkillResource certificateSkills)
    {
        Experiences = experiences;
        Companies = companies;
        Academies = academies;
        Educations = educations;
        Certificates = certificates;
        Skills = skills;
        UserSkills = userSkills;
        Languages = languages;
        UserLanguages = userLanguages;
        CertificateSkills = certificateSkills;
    }
}