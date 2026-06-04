using Facade.ProfileManagement.Contracts.DTOs;

namespace Facade.ProfileManagement.Contracts.Responses;

// Ответ операции записи просмотра профиля
public record ProfileViewResponse
{
    public bool Success { get; init; }

    public ProfileViewDto? ProfileView { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
