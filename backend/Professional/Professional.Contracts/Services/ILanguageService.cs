using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Language;
using Professional.Contracts.Results;

namespace Professional.Contracts.Services;

// Интерфейс сервиса языков в справочнике
public interface ILanguageService
{
    Task<LanguageDto?> GetByIdAsync(
        GetLanguageByIdParameters parameters);

    Task<LanguagesResult> GetLanguagesAsync(
        GetLanguagesParameters parameters,
        CancellationToken cancellationToken = default);

    Task<LanguageResult> CreateAsync(
        CreateLanguageParameters parameters);
}
