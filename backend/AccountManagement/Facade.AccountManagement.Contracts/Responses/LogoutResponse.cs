namespace Facade.AccountManagement.Contracts.Responses;

// Ответ logout
public record LogoutResponse
{
    public bool Success { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}