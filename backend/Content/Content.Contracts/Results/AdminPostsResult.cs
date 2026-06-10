using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

public record AdminPostsResult
{
    public IReadOnlyCollection<AdminPostDto> Items { get; init; } = Array.Empty<AdminPostDto>();

    public int TotalCount { get; init; }
}
