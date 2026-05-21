using Professional.Client.Contracts.Resources;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters;
using Professional.Contracts.Results;
using Professional.Contracts.Services;

namespace Professional.Client.Resources;

// Реализация Resource для Professional-модуля.
// В модульном монолите она обращается напрямую к IExperienceService.
public class ExperienceResource : IExperienceResource
{
    private readonly IExperienceService _experienceService;

    public ExperienceResource(IExperienceService experienceService)
    {
        _experienceService = experienceService;
    }

    public Task<IReadOnlyCollection<ExperienceDto>> GetUserExperiencesAsync(
        GetUserExperiencesParameters parameters)
    {
        return _experienceService.GetUserExperiencesAsync(parameters);
    }

    public Task<ExperienceDto?> GetByIdAsync(GetExperienceByIdParameters parameters)
    {
        return _experienceService.GetByIdAsync(parameters);
    }

    public Task<ExperienceResult> CreateAsync(CreateExperienceParameters parameters)
    {
        return _experienceService.CreateAsync(parameters);
    }

    public Task<ExperienceResult> UpdateAsync(UpdateExperienceParameters parameters)
    {
        return _experienceService.UpdateAsync(parameters);
    }

    public Task<ExperienceResult> PatchAsync(PatchExperienceParameters parameters)
    {
        return _experienceService.PatchAsync(parameters);
    }

    public Task<ExperienceResult> DeleteAsync(DeleteExperienceParameters parameters)
    {
        return _experienceService.DeleteAsync(parameters);
    }
}