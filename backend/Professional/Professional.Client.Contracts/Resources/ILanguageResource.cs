using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Language;
using Professional.Contracts.Results;

namespace Professional.Client.Contracts.Resources;

// Resource для работы с языками в справочнике.
// Это внутренняя точка доступа фасада к Professional-модулю.
public interface ILanguageResource
{
    Task<LanguageDto?> GetByIdAsync(
        GetLanguageByIdParameters parameters);

    Task<LanguagesResult> GetLanguagesAsync(
        GetLanguagesParameters parameters,
        CancellationToken cancellationToken = default);

    Task<LanguageResult> CreateAsync(
        CreateLanguageParameters parameters);
}
