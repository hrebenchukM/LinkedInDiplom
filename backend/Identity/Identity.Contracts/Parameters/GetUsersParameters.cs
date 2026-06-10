namespace Identity.Contracts.Parameters;

public record GetUsersParameters
{
    public int Skip { get; init; }

    public int Take { get; init; }

    public string? Email { get; init; }

    public string? Role { get; init; }

    public bool? IsDeleted { get; init; }

    public bool? IsLocked { get; init; }

    public string? SortBy { get; init; }

    public string? SortDirection { get; init; }
}
