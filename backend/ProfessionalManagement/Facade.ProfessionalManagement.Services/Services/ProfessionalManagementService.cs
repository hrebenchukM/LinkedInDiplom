using Facade.ProfessionalManagement.Contracts.Services;
using Professional.Client.Contracts;

namespace Facade.ProfessionalManagement.Services.Services;

// Фасадный сервис для Professional-модуля.
// Он не работает напрямую с DbContext.
// Он обращается к Professional через IProfessionalClient.
public partial class ProfessionalManagementService : IProfessionalManagementService
{
    private readonly IProfessionalClient _professionalClient;

    public ProfessionalManagementService(IProfessionalClient professionalClient)
    {
        _professionalClient = professionalClient;
    }
}