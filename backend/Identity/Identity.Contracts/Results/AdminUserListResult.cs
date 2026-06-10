using Identity.Contracts.DTOs;

namespace Identity.Contracts.Results;

public record AdminUserListResult
{
    public IReadOnlyCollection<AdminUserDto> Items { get; init; } = Array.Empty<AdminUserDto>();

    public int TotalCount { get; init; }
}
