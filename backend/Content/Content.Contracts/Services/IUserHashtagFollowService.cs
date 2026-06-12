using Content.Contracts.DTOs;
using Content.Contracts.Parameters.UserHashtagFollow;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса подписок пользователя на хэштеги
public interface IUserHashtagFollowService
{
    Task<UserHashtagFollowResult> FollowAsync(FollowHashtagParameters parameters);

    Task<UserHashtagFollowResult> UnfollowAsync(UnfollowHashtagParameters parameters);

    Task<IReadOnlyCollection<UserHashtagFollowDto>> GetMyFollowsAsync(GetMyHashtagFollowsParameters parameters);
}
