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

    public ProfessionalClient(
        IExperienceResource experiences,
        ICompanyResource companies,
        IAcademyResource academies,
        IEducationResource educations,
        ICertificateResource certificates)
    {
        Experiences = experiences;
        Companies = companies;
        Academies = academies;
        Educations = educations;
        Certificates = certificates;
    }
}