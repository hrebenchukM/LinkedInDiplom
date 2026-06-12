using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

// Результат операции с комментарием
public record CommentResult
{
    public bool Succeeded { get; init; }

    public CommentDto? Comment { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
