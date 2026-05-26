using Facade.ContentManagement.Contracts.DTOs;

namespace Facade.ContentManagement.Contracts.Responses;

// Ответ операций со связью поста и медиа
public record PostMediaResponse
{
    public bool Success { get; init; }

    public PostMediaDto? PostMedia { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
