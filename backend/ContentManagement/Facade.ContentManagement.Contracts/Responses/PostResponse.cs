using Facade.ContentManagement.Contracts.DTOs;

namespace Facade.ContentManagement.Contracts.Responses;

// Ответ операций с постом
public record PostResponse
{
    public bool Success { get; init; }

    public PostDto? Post { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
