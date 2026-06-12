using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Education;
using Professional.Contracts.Results;

namespace Professional.Contracts.Services;

// Интерфейс сервиса образования
public interface IEducationService
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
