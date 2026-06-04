using Content.Contracts.DTOs;
using Content.Contracts.Parameters.UserHashtagFollow;
using Content.Contracts.Results;

namespace Content.Client.Contracts.Resources;

// Resource для работы с подписками на хэштеги Content-модуля.
// Внутренняя точка доступа фасада к user_hashtag_follows.
public interface IUserHashtagFollowResource
{
    Task<UserHashtagFollowResult> FollowAsync(FollowHashtagParameters parameters);

    Task<UserHashtagFollowResult> UnfollowAsync(UnfollowHashtagParameters parameters);

    Task<IReadOnlyCollection<UserHashtagFollowDto>> GetMyFollowsAsync(GetMyHashtagFollowsParameters parameters);
}
