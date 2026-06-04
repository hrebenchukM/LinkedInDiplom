using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

// Результат операции с сохранённым постом
public record SavedPostResult
{
    public bool Succeeded { get; init; }

    public SavedPostDto? SavedPost { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
