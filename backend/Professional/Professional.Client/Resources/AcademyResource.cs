using Professional.Client.Contracts.Resources;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Academy;
using Professional.Contracts.Results;
using Professional.Contracts.Services;

namespace Professional.Client.Resources;

// Реализация Resource для учебных заведений.
// В модульном монолите она обращается напрямую к IAcademyService.
public class AcademyResource : IAcademyResource
{
    private readonly IAcademyService _academyService;

    public AcademyResource(IAcademyService academyService)
    {
        _academyService = academyService;
    }

    public Task<AcademyDto?> GetByIdAsync(GetAcademyByIdParameters parameters)
    {
        return _academyService.GetByIdAsync(parameters);
    }

    public Task<AcademyResult> CreateAsync(CreateAcademyParameters parameters)
    {
        return _academyService.CreateAsync(parameters);
    }

    public Task<AcademyResult> PatchAsync(PatchAcademyParameters parameters)
    {
        return _academyService.PatchAsync(parameters);
    }
}
