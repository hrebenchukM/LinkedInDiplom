namespace Identity.Contracts.Parameters;

public record LoginParameters
{
    public string Email { get; init; } = default!;
    public string Password { get; init; } = default!;
}
