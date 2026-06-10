using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Academy;
using Professional.Contracts.Results;

namespace Professional.Contracts.Services;

// Интерфейс сервиса учебных заведений
public interface IAcademyService
{
    Task<AcademyDto?> GetByIdAsync(
        GetAcademyByIdParameters parameters);

    Task<AcademyResult> CreateAsync(
        CreateAcademyParameters parameters);

    Task<AcademyResult> PatchAsync(
        PatchAcademyParameters parameters);
}
