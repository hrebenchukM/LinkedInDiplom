namespace Identity.Contracts.Parameters;

public record RevokeTokenParameters
{
    public string RefreshToken { get; init; } = default!;
}
