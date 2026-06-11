using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

public record AdminCommentsResult
{
    public IReadOnlyCollection<AdminCommentDto> Items { get; init; } = Array.Empty<AdminCommentDto>();

    public int TotalCount { get; init; }
}
