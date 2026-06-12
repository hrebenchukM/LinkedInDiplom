using Profile.Contracts.DTOs;

namespace Profile.Contracts.Results;

public record SearchProfilesResult
{
    public IReadOnlyCollection<ProfileSearchItemDto> Items { get; init; } = Array.Empty<ProfileSearchItemDto>();

    public int TotalCount { get; init; }
}
