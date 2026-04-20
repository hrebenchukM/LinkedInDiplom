using Facade.AccountManagement.Contracts.DTOs;

namespace Facade.AccountManagement.Contracts.Responses;

public record LoginResponse
{
    public bool Success { get; init; }
    public AccountDto? Account { get; init; }
    public AuthTokenDto? Token { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
