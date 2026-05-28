using Facade.ProfessionalManagement.Contracts.Services;
using Professional.Client.Contracts;

namespace Facade.ProfessionalManagement.Services.Services;

/// <summary>
/// Facade service слоя BFF для Professional.
/// Не содержит доступа к DataAccess: оркеструет вызовы через IProfessionalClient и делает mapping.
/// </summary>
public partial class ProfessionalManagementService : IProfessionalManagementService
{
    private readonly IProfessionalClient _professionalClient;

    public ProfessionalManagementService(IProfessionalClient professionalClient)
    {
        _professionalClient = professionalClient;
    }
}