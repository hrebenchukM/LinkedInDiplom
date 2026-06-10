namespace Identity.Contracts.Parameters;

public record GetUsersParameters
{
    public int Skip { get; init; }

    public int Take { get; init; }
}
