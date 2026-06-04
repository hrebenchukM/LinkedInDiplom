using Facade.ContentManagement.Contracts.DTOs;

namespace Facade.ContentManagement.Contracts.Responses;

// Ответ операций с подпиской на хэштег
public record UserHashtagFollowResponse
{
    public bool Success { get; init; }

    public UserHashtagFollowDto? UserHashtagFollow { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
