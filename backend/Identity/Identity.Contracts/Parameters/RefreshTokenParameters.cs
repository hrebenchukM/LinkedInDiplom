namespace Identity.Contracts.Parameters;

public record RefreshTokenParameters
{
    public string RefreshToken { get; init; } = default!;
}
