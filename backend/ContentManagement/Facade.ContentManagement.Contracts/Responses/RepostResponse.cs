using Facade.ContentManagement.Contracts.DTOs;

namespace Facade.ContentManagement.Contracts.Responses;

// Ответ операций с репостом
public record RepostResponse
{
    public bool Success { get; init; }

    public RepostDto? Repost { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
