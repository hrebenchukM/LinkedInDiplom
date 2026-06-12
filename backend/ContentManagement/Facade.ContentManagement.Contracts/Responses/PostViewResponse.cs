using Facade.ContentManagement.Contracts.DTOs;

namespace Facade.ContentManagement.Contracts.Responses;

// Ответ операций с просмотром поста
public record PostViewResponse
{
    public bool Success { get; init; }

    public PostViewDto? PostView { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
