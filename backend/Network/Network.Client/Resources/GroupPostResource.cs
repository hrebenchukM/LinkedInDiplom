using Network.Client.Contracts.Resources;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.GroupPost;
using Network.Contracts.Results;
using Network.Contracts.Services;

namespace Network.Client.Resources;

// Реализация Resource для связей группы и постов.
// Делегирует вызовы в IGroupPostService.
public class GroupPostResource : IGroupPostResource
{
    private readonly IGroupPostService _groupPostService;

    public GroupPostResource(IGroupPostService groupPostService)
    {
        _groupPostService = groupPostService;
    }

    public Task<GroupPostResult> AttachPostToGroupAsync(AttachGroupPostParameters parameters)
    {
        return _groupPostService.AttachPostToGroupAsync(parameters);
    }

    public Task<GroupPostResult> DetachPostFromGroupAsync(DetachGroupPostParameters parameters)
    {
        return _groupPostService.DetachPostFromGroupAsync(parameters);
    }

    public Task<IReadOnlyCollection<GroupPostDto>> GetGroupPostsAsync(GetGroupPostsParameters parameters)
    {
        return _groupPostService.GetGroupPostsAsync(parameters);
    }
}
