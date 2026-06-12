namespace Profile.Contracts.Parameters;

public record SearchProfilesParameters
{
    public int Skip { get; init; }

    public int Take { get; init; }

    public string? Query { get; init; }

    public string? Location { get; init; }
}
