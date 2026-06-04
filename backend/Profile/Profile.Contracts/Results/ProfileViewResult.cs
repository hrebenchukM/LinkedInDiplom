using Profile.Contracts.DTOs;

namespace Profile.Contracts.Results;

// Результат операции записи просмотра профиля
public record ProfileViewResult
{
    public bool Succeeded { get; init; }

    public ProfileViewDto? ProfileView { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
