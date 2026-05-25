using Professional.Client.Contracts.Resources;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Language;
using Professional.Contracts.Results;
using Professional.Contracts.Services;

namespace Professional.Client.Resources;

// Реализация Resource для языков в справочнике.
// В модульном монолите она обращается напрямую к ILanguageService.
public class LanguageResource : ILanguageResource
{
    private readonly ILanguageService _languageService;

    public LanguageResource(ILanguageService languageService)
    {
        _languageService = languageService;
    }

    public Task<LanguageDto?> GetByIdAsync(GetLanguageByIdParameters parameters)
    {
        return _languageService.GetByIdAsync(parameters);
    }

    public Task<LanguageResult> CreateAsync(CreateLanguageParameters parameters)
    {
        return _languageService.CreateAsync(parameters);
    }
}
