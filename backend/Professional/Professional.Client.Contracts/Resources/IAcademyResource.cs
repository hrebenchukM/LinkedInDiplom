using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Academy;
using Professional.Contracts.Results;

namespace Professional.Client.Contracts.Resources;

// Resource для работы с учебными заведениями.
// Это внутренняя точка доступа фасада к Professional-модулю.
public interface IAcademyResource
{
    Task<AcademyDto?> GetByIdAsync(
        GetAcademyByIdParameters parameters);

    Task<AcademyResult> CreateAsync(
        CreateAcademyParameters parameters);
}
