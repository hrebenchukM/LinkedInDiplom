using Professional.Client.Contracts.Resources;

namespace Professional.Client.Contracts;

// Внутренний клиент Professional-модуля.
// По аналогии с IdentityClient и ProfileClient.
public interface IProfessionalClient
{
    IExperienceResource Experiences { get; }
}