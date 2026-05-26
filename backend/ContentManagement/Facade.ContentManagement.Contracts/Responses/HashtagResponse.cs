using Facade.ContentManagement.Contracts.DTOs;

namespace Facade.ContentManagement.Contracts.Responses;

// Ответ операций с хэштегом
public record HashtagResponse
{
    public bool Success { get; init; }

    public HashtagDto? Hashtag { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
