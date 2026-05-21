using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Experience;
using Professional.Contracts.Results;

namespace Professional.Contracts.Services;

// Интерфейс сервиса опыта работы
public interface IExperienceService
{
    Task<IReadOnlyCollection<ExperienceDto>> GetUserExperiencesAsync(
        GetUserExperiencesParameters parameters);

    Task<ExperienceDto?> GetByIdAsync(
        GetExperienceByIdParameters parameters);

    Task<ExperienceResult> CreateAsync(
        CreateExperienceParameters parameters);

    Task<ExperienceResult> UpdateAsync(
        UpdateExperienceParameters parameters);

    Task<ExperienceResult> PatchAsync(
        PatchExperienceParameters parameters);

    Task<ExperienceResult> DeleteAsync(
        DeleteExperienceParameters parameters);
}