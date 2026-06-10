using Content.Contracts.Parameters.Comment;
using Facade.ContentManagement.Contracts.DTOs;
using Facade.ContentManagement.Contracts.Requests.Comment;
using Facade.ContentManagement.Contracts.Responses;
using Facade.Shared.Contracts.Pagination;

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

    public async Task<PagedResponse<CommentDto>> GetCommentsByPostIdAsync(
        string userId,
        Guid postId,
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _contentClient.Comments.GetByPostIdAsync(new GetCommentsByPostParameters
        {
            ViewerUserId = userId,
            PostId = postId,
            Skip = skip,
            Take = pageSize
        });

        var items = result.Items.Select(MapCommentToFacadeDto).ToList();
        return Pagination.Create(items, page, pageSize, result.TotalCount);
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
