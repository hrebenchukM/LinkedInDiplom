using Facade.ProfileManagement.Contracts.DTOs;

namespace Facade.ProfileManagement.Contracts.Responses;

// Ответ ProfileManagement фасада
public record ProfileResponse
{
    public bool Success { get; init; }

    public ProfileDto? Profile { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}