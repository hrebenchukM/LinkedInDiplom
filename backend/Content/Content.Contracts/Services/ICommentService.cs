using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Comment;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса комментариев
public interface ICommentService
{
    Task<CommentResult> CreateAsync(CreateCommentParameters parameters);

    Task<PostCommentsResult> GetByPostIdAsync(GetCommentsByPostParameters parameters);

    Task<CommentResult> UpdateAsync(UpdateCommentParameters parameters);

    Task<CommentResult> DeleteAsync(DeleteCommentParameters parameters);

    Task<AdminCommentsResult> GetAdminCommentsAsync(
        GetAdminCommentsParameters parameters,
        CancellationToken cancellationToken = default);

    Task AdminSoftDeleteCommentAsync(
        Guid commentId,
        CancellationToken cancellationToken = default);

    Task AdminRestoreCommentAsync(
        Guid commentId,
        CancellationToken cancellationToken = default);
}
