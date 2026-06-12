using Content.Contracts.Parameters.SavedPost;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Responses;

namespace Facade.ContentManagement.Services.Services;

public partial class ContentManagementService
{
    public async Task<SavedPostResponse> SavePostAsync(string userId, Guid postId)
    {
        var result = await _contentClient.SavedPosts.SaveAsync(new SavePostParameters
        {
            UserId = userId,
            PostId = postId
        });

        return MapSavedPostResult(result);
    }

    public async Task<SavedPostResponse> UnsavePostAsync(string userId, Guid postId)
    {
        var result = await _contentClient.SavedPosts.UnsaveAsync(new UnsavePostParameters
        {
            UserId = userId,
            PostId = postId
        });

        return MapSavedPostResult(result);
    }

    public async Task<IReadOnlyCollection<SavedPostDto>> GetMySavedPostsAsync(string userId)
    {
        var savedPosts = await _contentClient.SavedPosts.GetMySavedPostsAsync(new GetMySavedPostsParameters
        {
            UserId = userId
        });

        return savedPosts.Select(MapSavedPostToFacadeDto).ToList();
    }
}
