using Professional.Client.Contracts.Resources;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Education;
using Professional.Contracts.Results;
using Professional.Contracts.Services;

namespace Professional.Client.Resources;

// Реализация Resource для образования.
// В модульном монолите она обращается напрямую к IEducationService.
public class EducationResource : IEducationResource
{
    private readonly IEducationService _educationService;

    public EducationResource(IEducationService educationService)
    {
        _educationService = educationService;
    }

    public Task<IReadOnlyCollection<EducationDto>> GetUserEducationsAsync(
        GetUserEducationsParameters parameters)
    {
        return _educationService.GetUserEducationsAsync(parameters);
    }

    public Task<EducationDto?> GetByIdAsync(GetEducationByIdParameters parameters)
    {
        return _educationService.GetByIdAsync(parameters);
    }

    public Task<EducationResult> CreateAsync(CreateEducationParameters parameters)
    {
        return _educationService.CreateAsync(parameters);
    }

    public Task<EducationResult> UpdateAsync(UpdateEducationParameters parameters)
    {
        return _educationService.UpdateAsync(parameters);
    }

    public Task<EducationResult> PatchAsync(PatchEducationParameters parameters)
    {
        return _educationService.PatchAsync(parameters);
    }

    public Task<EducationResult> DeleteAsync(DeleteEducationParameters parameters)
    {
        return _educationService.DeleteAsync(parameters);
    }
}
