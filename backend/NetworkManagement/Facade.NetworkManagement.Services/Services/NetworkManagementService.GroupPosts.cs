using Content.Contracts.Parameters.Post;
using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Responses;
using Network.Contracts.Parameters.GroupPost;
using Network.Contracts.Parameters.UserGroup;

namespace Facade.NetworkManagement.Services.Services;

public partial class NetworkManagementService
{
    public async Task<GroupPostResponse> AttachPostToGroupAsync(string userId, Guid groupId, Guid postId)
    {
        var post = await _contentClient.Posts.GetByIdAsync(new GetPostByIdParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        if (post == null || post.UserId != userId)
        {
            return new GroupPostResponse
            {
                Success = false,
                Errors = new[] { "Post not found." }
            };
        }

        var result = await _networkClient.GroupPosts.AttachPostToGroupAsync(new AttachGroupPostParameters
        {
            UserId = userId,
            GroupId = groupId,
            PostId = postId
        });

        return MapGroupPostResult(result);
    }

    public async Task<GroupPostResponse> DetachPostFromGroupAsync(string userId, Guid groupId, Guid postId)
    {
        var post = await _contentClient.Posts.GetByIdAsync(new GetPostByIdParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        if (post == null || post.UserId != userId)
        {
            return new GroupPostResponse
            {
                Success = false,
                Errors = new[] { "Post not found." }
            };
        }

        var result = await _networkClient.GroupPosts.DetachPostFromGroupAsync(new DetachGroupPostParameters
        {
            UserId = userId,
            GroupId = groupId,
            PostId = postId
        });

        return MapGroupPostResult(result);
    }

    public async Task<IReadOnlyCollection<GroupPostDto>?> GetGroupPostsAsync(string userId, Guid groupId)
    {
        var group = await _networkClient.UserGroups.GetByIdAsync(new GetUserGroupByIdParameters
        {
            UserId = userId,
            GroupId = groupId
        });

        if (group == null)
        {
            return null;
        }

        var groupPosts = await _networkClient.GroupPosts.GetGroupPostsAsync(new GetGroupPostsParameters
        {
            UserId = userId,
            GroupId = groupId
        });

        return groupPosts.Select(MapGroupPostToFacadeDto).ToList();
    }
}
