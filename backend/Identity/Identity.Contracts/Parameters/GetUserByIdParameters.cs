namespace Identity.Contracts.Parameters;

public record GetUserByIdParameters
{
    public string UserId { get; init; } = default!;
}
