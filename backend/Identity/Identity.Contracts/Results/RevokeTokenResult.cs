namespace Identity.Contracts.Results;

public record RevokeTokenResult
{
    public bool Succeeded { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
