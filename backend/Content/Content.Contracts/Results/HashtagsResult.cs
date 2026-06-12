using Content.Contracts.DTOs;

namespace Content.Contracts.Results;

public record HashtagsResult
{
    public IReadOnlyCollection<HashtagDto> Items { get; init; } = Array.Empty<HashtagDto>();

    public int TotalCount { get; init; }
}
