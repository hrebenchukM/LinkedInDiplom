using Facade.ContentManagement.Contracts.DTOs;

namespace Facade.ContentManagement.Contracts.Responses;

// Ответ операций с комментарием
public record CommentResponse
{
    public bool Success { get; init; }

    public CommentDto? Comment { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
