using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

public record PostCommentsResult
{
    public IReadOnlyCollection<CommentDto> Items { get; init; } = Array.Empty<CommentDto>();

    public int TotalCount { get; init; }
}
