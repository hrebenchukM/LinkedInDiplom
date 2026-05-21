using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Experience;
using Professional.Contracts.Results;

namespace Professional.Client.Contracts.Resources;

// Resource для работы с опытом работы.
// Это внутренняя точка доступа фасада к Professional-модулю.
public interface IExperienceResource
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