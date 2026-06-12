using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Comment;
using Content.Contracts.Results;
using Content.Contracts.Services;

namespace Content.Client.Resources;

// Реализация Resource для комментариев.
// Делегирует вызовы в ICommentService.
public class CommentResource : ICommentResource
{
    private readonly ICommentService _commentService;

    public CommentResource(ICommentService commentService)
    {
        _commentService = commentService;
    }

    public Task<CommentResult> CreateAsync(CreateCommentParameters parameters)
    {
        return _commentService.CreateAsync(parameters);
    }

    public Task<PostCommentsResult> GetByPostIdAsync(GetCommentsByPostParameters parameters)
    {
        return _commentService.GetByPostIdAsync(parameters);
    }

    public Task<CommentResult> UpdateAsync(UpdateCommentParameters parameters)
    {
        return _commentService.UpdateAsync(parameters);
    }

    public Task<CommentResult> DeleteAsync(DeleteCommentParameters parameters)
    {
        return _commentService.DeleteAsync(parameters);
    }

    public Task<AdminCommentsResult> GetAdminCommentsAsync(
        GetAdminCommentsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        return _commentService.GetAdminCommentsAsync(parameters, cancellationToken);
    }

    public Task AdminSoftDeleteCommentAsync(
        Guid commentId,
        CancellationToken cancellationToken = default)
    {
        return _commentService.AdminSoftDeleteCommentAsync(commentId, cancellationToken);
    }

    public Task AdminRestoreCommentAsync(
        Guid commentId,
        CancellationToken cancellationToken = default)
    {
        return _commentService.AdminRestoreCommentAsync(commentId, cancellationToken);
    }
}
