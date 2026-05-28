using Content.Contracts.Parameters.Post;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Requests.Post;
using Facade.ContentManagement.Contracts.Responses;

namespace Facade.ContentManagement.Services.Services;

public partial class ContentManagementService
{
    public async Task<PostResponse> CreatePostAsync(string userId, CreatePostRequest request)
    {
        var result = await _contentClient.Posts.CreateAsync(new CreatePostParameters
        {
            AuthorId = userId,
            Content = request.Content,
            Visibility = request.Visibility ?? string.Empty,
            MediaIds = request.MediaIds
        });

        return MapPostResult(result);
    }

    public async Task<IReadOnlyCollection<PostDto>> GetMyPostsAsync(string userId)
    {
        var posts = await _contentClient.Posts.GetMyPostsAsync(new GetMyPostsParameters
        {
            AuthorId = userId
        });

        return posts.Select(MapPostToFacadeDto).ToList();
    }

    public async Task<PostDto?> GetPostByIdAsync(string userId, Guid postId)
    {
        var post = await _contentClient.Posts.GetByIdAsync(new GetPostByIdParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return post == null ? null : MapPostToFacadeDto(post);
    }

    public async Task<PostResponse> UpdatePostAsync(string userId, Guid postId, UpdatePostRequest request)
    {
        var result = await _contentClient.Posts.UpdateAsync(new UpdatePostParameters
        {
            AuthorId = userId,
            PostId = postId,
            Content = request.Content,
            Visibility = request.Visibility
        });

        return MapPostResult(result);
    }

    public async Task<PostResponse> DeletePostAsync(string userId, Guid postId)
    {
        var result = await _contentClient.Posts.DeleteAsync(new DeletePostParameters
        {
            AuthorId = userId,
            PostId = postId
        });

        return MapPostResult(result);
    }
}
