using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

// Результат операции с языком пользователя
public record UserLanguageResult
{
    public bool Succeeded { get; init; }

    public UserLanguageDto? UserLanguage { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
