using Facade.ContentManagement.Contracts.DTOs;

namespace Facade.ContentManagement.Contracts.Responses;

// Ответ операций с сохранённым постом
public record SavedPostResponse
{
    public bool Success { get; init; }

    public SavedPostDto? SavedPost { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
