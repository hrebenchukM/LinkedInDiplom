using Facade.AccountManagement.Contracts.DTOs;

namespace Facade.AccountManagement.Contracts.Responses;

// Ответ обновления токена
public record RefreshTokenResponse
{
    public bool Success { get; init; }

    public AuthTokenDto? Token { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}