using Identity.Contracts.DTOs;

namespace Identity.Contracts.Results;

public record LoginResult
{
    public bool Succeeded { get; init; }
    public UserDto? User { get; init; }
    public TokenDto? Token { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
