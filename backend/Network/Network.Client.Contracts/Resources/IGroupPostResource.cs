using Network.Contracts.DTOs;
using Network.Contracts.Parameters.GroupPost;
using Network.Contracts.Results;

namespace Network.Client.Contracts.Resources;

// Resource для работы со связями группы и постов Network-модуля.
// Внутренняя точка доступа фасада к group_posts.
public interface IGroupPostResource
{
    Task<GroupPostResult> AttachPostToGroupAsync(AttachGroupPostParameters parameters);

    Task<GroupPostResult> DetachPostFromGroupAsync(DetachGroupPostParameters parameters);

    Task<IReadOnlyCollection<GroupPostDto>> GetGroupPostsAsync(GetGroupPostsParameters parameters);
}
