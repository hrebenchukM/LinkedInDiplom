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
}
