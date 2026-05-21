using Professional.Client.Contracts;
using Professional.Client.Contracts.Resources;

namespace Professional.Client;

// Внутренний клиент Professional-модуля.
public class ProfessionalClient : IProfessionalClient
{
    public IExperienceResource Experiences { get; }

    public ICompanyResource Companies { get; }

    public ProfessionalClient(
        IExperienceResource experiences,
        ICompanyResource companies)
    {
        Experiences = experiences;
        Companies = companies;
    }
}