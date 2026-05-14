using Identity.Contracts.DTOs;

namespace Identity.Contracts.Results;

public record RegisterUserResult
{
    public bool Succeeded { get; init; }
    public UserDto? User { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
