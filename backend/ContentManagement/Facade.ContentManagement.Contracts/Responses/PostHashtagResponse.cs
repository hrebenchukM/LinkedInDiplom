using Facade.ContentManagement.Contracts.DTOs;

namespace Facade.ContentManagement.Contracts.Responses;

// Ответ операций со связью поста и хэштега
public record PostHashtagResponse
{
    public bool Success { get; init; }

    public PostHashtagDto? PostHashtag { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
