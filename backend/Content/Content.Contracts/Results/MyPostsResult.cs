using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

public record MyPostsResult
{
    public IReadOnlyCollection<PostDto> Items { get; init; } = Array.Empty<PostDto>();

    public int TotalCount { get; init; }
}
