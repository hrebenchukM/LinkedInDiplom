using Facade.ProfessionalManagement.Contracts.Services;
using Facade.FileStorage.Contracts.Services;
using Professional.Client.Contracts;
using Profile.Client.Contracts;

namespace Facade.ProfessionalManagement.Services.Services;

/// <summary>
/// Facade service слоя BFF для Professional.
/// Не содержит доступа к DataAccess: оркеструет вызовы через IProfessionalClient и делает mapping.
/// </summary>
public partial class ProfessionalManagementService : IProfessionalManagementService
{
    private readonly IProfessionalClient _professionalClient;
    private readonly IProfileClient _profileClient;
    private readonly IFileStorageService _fileStorageService;

    public ProfessionalManagementService(
        IProfessionalClient professionalClient,
        IProfileClient profileClient,
        IFileStorageService fileStorageService)
    {
        _professionalClient = professionalClient;
        _profileClient = profileClient;
        _fileStorageService = fileStorageService;
    }
}