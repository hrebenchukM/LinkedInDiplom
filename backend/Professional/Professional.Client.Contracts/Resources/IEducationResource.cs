using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Education;
using Professional.Contracts.Results;

namespace Professional.Client.Contracts.Resources;

// Resource для работы с образованием.
// Это внутренняя точка доступа фасада к Professional-модулю.
public interface IEducationResource
{
    Task<IReadOnlyCollection<EducationDto>> GetUserEducationsAsync(
        GetUserEducationsParameters parameters);

    Task<EducationDto?> GetByIdAsync(
        GetEducationByIdParameters parameters);

    Task<EducationResult> CreateAsync(
        CreateEducationParameters parameters);

    Task<EducationResult> UpdateAsync(
        UpdateEducationParameters parameters);

    Task<EducationResult> PatchAsync(
        PatchEducationParameters parameters);

    Task<EducationResult> DeleteAsync(
        DeleteEducationParameters parameters);
}
