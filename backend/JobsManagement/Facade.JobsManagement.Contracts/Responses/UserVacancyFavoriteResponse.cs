using Facade.JobsManagement.Contracts.DTOs;

namespace Facade.JobsManagement.Contracts.Responses;

public record UserVacancyFavoriteResponse
{
    public bool Success { get; init; }
    public UserVacancyFavoriteDto? Favorite { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
