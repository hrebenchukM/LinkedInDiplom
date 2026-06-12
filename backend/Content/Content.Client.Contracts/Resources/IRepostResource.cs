using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Repost;
using Content.Contracts.Results;

namespace Content.Client.Contracts.Resources;

// Resource для работы с репостами Content-модуля.
// Внутренняя точка доступа фасада к reposts.
public interface IRepostResource
{
    Task<RepostResult> RepostAsync(RepostPostParameters parameters);

    Task<RepostResult> UnrepostAsync(UnrepostPostParameters parameters);

    Task<IReadOnlyCollection<RepostDto>> GetMyRepostsAsync(GetMyRepostsParameters parameters);

    Task<IReadOnlyCollection<RepostDto>> GetByPostIdAsync(GetRepostsByPostParameters parameters);
}
