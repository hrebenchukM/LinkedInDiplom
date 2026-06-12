using Network.Contracts.DTOs;
using Network.Contracts.Parameters.GroupPost;
using Network.Contracts.Results;

namespace Network.Contracts.Services;

// Интерфейс сервиса связей группы и постов
public interface IGroupPostService
{
    Task<GroupPostResult> AttachPostToGroupAsync(AttachGroupPostParameters parameters);

    Task<GroupPostResult> DetachPostFromGroupAsync(DetachGroupPostParameters parameters);

    Task<IReadOnlyCollection<GroupPostDto>> GetGroupPostsAsync(GetGroupPostsParameters parameters);
}
