using Jobs.Contracts.DTOs;

namespace Jobs.Contracts.Results;

public record UserVacancyFavoriteResult
{
    public bool Succeeded { get; init; }
    public UserVacancyFavoriteDto? UserVacancyFavorite { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
