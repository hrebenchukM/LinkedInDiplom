using Content.Contracts.Parameters.Comment;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Requests.Comment;
using Facade.ContentManagement.Contracts.Responses;

namespace Facade.ContentManagement.Services.Services;

public partial class ContentManagementService
{
    public async Task<CommentResponse> CreateCommentAsync(string userId, Guid postId, CreateCommentRequest request)
    {
        var result = await _contentClient.Comments.CreateAsync(new CreateCommentParameters
        {
            AuthorId = userId,
            PostId = postId,
            Content = request.Content,
            ParentCommentId = request.ParentCommentId
        });

        return MapCommentResult(result);
    }

    public async Task<IReadOnlyCollection<CommentDto>> GetCommentsByPostIdAsync(string userId, Guid postId)
    {
        var comments = await _contentClient.Comments.GetByPostIdAsync(new GetCommentsByPostParameters
        {
            ViewerUserId = userId,
            PostId = postId
        });

        return comments.Select(MapCommentToFacadeDto).ToList();
    }

    public async Task<CommentResponse> UpdateCommentAsync(string userId, Guid commentId, UpdateCommentRequest request)
    {
        var result = await _contentClient.Comments.UpdateAsync(new UpdateCommentParameters
        {
            AuthorId = userId,
            CommentId = commentId,
            Content = request.Content
        });

        return MapCommentResult(result);
    }

    public async Task<CommentResponse> DeleteCommentAsync(string userId, Guid commentId)
    {
        var result = await _contentClient.Comments.DeleteAsync(new DeleteCommentParameters
        {
            AuthorId = userId,
            CommentId = commentId
        });

        return MapCommentResult(result);
    }
}
