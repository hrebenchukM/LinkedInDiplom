using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

public record FeedPostsResult
{
    public IReadOnlyCollection<PostDto> Items { get; init; } = Array.Empty<PostDto>();

    public int TotalCount { get; init; }
}
