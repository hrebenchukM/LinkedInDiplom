namespace Identity.Contracts.Parameters;

public record ExternalLoginParameters
{
    public required string Provider { get; init; }
    public required string ProviderToken { get; init; }
}
