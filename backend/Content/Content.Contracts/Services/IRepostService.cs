using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Repost;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса репостов
public interface IRepostService
{
    Task<RepostResult> RepostAsync(RepostPostParameters parameters);

    Task<RepostResult> UnrepostAsync(UnrepostPostParameters parameters);

    Task<IReadOnlyCollection<RepostDto>> GetMyRepostsAsync(GetMyRepostsParameters parameters);

    Task<IReadOnlyCollection<RepostDto>> GetByPostIdAsync(GetRepostsByPostParameters parameters);
}
