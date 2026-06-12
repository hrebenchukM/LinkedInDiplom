using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Comment;
using Content.Contracts.Results;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Content.Events.Contracts.Events;
using Identity.Events.Contracts.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Content.Services.Services;

// Сервис комментариев
public class CommentService : ICommentService
{
    private const string VisibilityPrivate = "private";

    private readonly ContentDbContext _dbContext;
    private readonly IDomainEventPublisher _domainEventPublisher;

    public CommentService(
        ContentDbContext dbContext,
        IDomainEventPublisher domainEventPublisher)
    {
        _dbContext = dbContext;
        _domainEventPublisher = domainEventPublisher;
    }

    public async Task<CommentResult> CreateAsync(CreateCommentParameters parameters)
    {
        var content = parameters.Content.Trim();

        if (string.IsNullOrEmpty(content))
        {
            return Error("Comment content is required.");
        }

        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return PostNotFound();
        }

        if (post.Visibility == VisibilityPrivate && post.UserId != parameters.AuthorId)
        {
            return PostNotFound();
        }

        if (parameters.ParentCommentId.HasValue)
        {
            var parent = await _dbContext.Comments
                .AsNoTracking()
                .FirstOrDefaultAsync(c =>
                    c.Id == parameters.ParentCommentId.Value &&
                    c.DeletedAt == null);

            if (parent == null ||
                parent.PostId != parameters.PostId)
            {
                return Error("Parent comment not found.");
            }
        }

        var now = DateTime.UtcNow;

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            PostId = parameters.PostId,
            UserId = parameters.AuthorId,
            ParentCommentId = parameters.ParentCommentId,
            Content = content,
            CreatedAt = now,
            UpdatedAt = null,
            DeletedAt = null
        };

        _dbContext.Comments.Add(comment);
        post.CommentCount += 1;

        await _dbContext.SaveChangesAsync();

        await _domainEventPublisher.PublishAsync(new CommentCreatedEvent
        {
            CommentId = comment.Id,
            PostId = post.Id,
            PostAuthorUserId = post.UserId,
            CommentAuthorUserId = parameters.AuthorId,
            CreatedAt = comment.CreatedAt
        });

        return Success(comment);
    }

    public async Task<PostCommentsResult> GetByPostIdAsync(GetCommentsByPostParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return new PostCommentsResult();
        }

        if (post.Visibility == VisibilityPrivate && post.UserId != parameters.ViewerUserId)
        {
            return new PostCommentsResult();
        }

        var query = _dbContext.Comments
            .AsNoTracking()
            .Where(c =>
                c.PostId == parameters.PostId &&
                c.DeletedAt == null);

        var totalCount = await query.CountAsync();

        var comments = await query
            .OrderBy(c => c.CreatedAt)
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync();

        return new PostCommentsResult
        {
            Items = comments.Select(MapToDto).ToList(),
            TotalCount = totalCount
        };
    }

    public async Task<CommentResult> UpdateAsync(UpdateCommentParameters parameters)
    {
        var comment = await _dbContext.Comments
            .FirstOrDefaultAsync(c =>
                c.Id == parameters.CommentId &&
                c.UserId == parameters.AuthorId &&
                c.DeletedAt == null);

        if (comment == null)
        {
            return CommentNotFound();
        }

        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == comment.PostId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return CommentNotFound();
        }

        var content = parameters.Content.Trim();

        if (string.IsNullOrEmpty(content))
        {
            return Error("Comment content is required.");
        }

        var now = DateTime.UtcNow;
        comment.Content = content;
        comment.UpdatedAt = now;

        await _dbContext.SaveChangesAsync();

        return Success(comment);
    }

    public async Task<CommentResult> DeleteAsync(DeleteCommentParameters parameters)
    {
        var comment = await _dbContext.Comments
            .FirstOrDefaultAsync(c =>
                c.Id == parameters.CommentId &&
                c.UserId == parameters.AuthorId &&
                c.DeletedAt == null);

        if (comment == null)
        {
            return CommentNotFound();
        }

        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p =>
                p.Id == comment.PostId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return CommentNotFound();
        }

        var now = DateTime.UtcNow;
        comment.DeletedAt = now;
        comment.UpdatedAt = now;
        post.CommentCount = Math.Max(0, post.CommentCount - 1);

        await _dbContext.SaveChangesAsync();

        return Success(comment);
    }

    public async Task AdminSoftDeleteCommentAsync(
        Guid commentId,
        CancellationToken cancellationToken = default)
    {
        var comment = await _dbContext.Comments
            .FirstOrDefaultAsync(c => c.Id == commentId, cancellationToken);

        if (comment == null)
        {
            throw new InvalidOperationException($"Comment with id '{commentId}' was not found.");
        }

        if (comment.DeletedAt != null)
        {
            return;
        }

        var now = DateTime.UtcNow;
        comment.DeletedAt = now;
        comment.UpdatedAt = now;

        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p => p.Id == comment.PostId && p.DeletedAt == null, cancellationToken);

        if (post != null)
        {
            post.CommentCount = Math.Max(0, post.CommentCount - 1);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AdminRestoreCommentAsync(
        Guid commentId,
        CancellationToken cancellationToken = default)
    {
        var comment = await _dbContext.Comments
            .FirstOrDefaultAsync(c => c.Id == commentId, cancellationToken);

        if (comment == null)
        {
            throw new InvalidOperationException($"Comment with id '{commentId}' was not found.");
        }

        if (comment.DeletedAt == null)
        {
            return;
        }

        comment.DeletedAt = null;
        comment.UpdatedAt = DateTime.UtcNow;

        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p => p.Id == comment.PostId && p.DeletedAt == null, cancellationToken);

        if (post != null)
        {
            post.CommentCount += 1;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<AdminCommentsResult> GetAdminCommentsAsync(
        GetAdminCommentsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Comments.AsNoTracking();

        if (parameters.PostId.HasValue)
        {
            query = query.Where(c => c.PostId == parameters.PostId.Value);
        }

        if (!string.IsNullOrWhiteSpace(parameters.AuthorUserId))
        {
            query = query.Where(c => c.UserId == parameters.AuthorUserId.Trim());
        }

        if (parameters.IsDeleted == true)
        {
            query = query.Where(c => c.DeletedAt != null);
        }
        else if (parameters.IsDeleted == false)
        {
            query = query.Where(c => c.DeletedAt == null);
        }
        else if (parameters.IncludeDeleted == false)
        {
            query = query.Where(c => c.DeletedAt == null);
        }

        if (!string.IsNullOrWhiteSpace(parameters.Query))
        {
            var searchPattern = $"%{parameters.Query.Trim()}%";
            query = query.Where(c => EF.Functions.ILike(c.Content, searchPattern));
        }

        if (parameters.FromCreatedAt.HasValue)
        {
            query = query.Where(c => c.CreatedAt >= parameters.FromCreatedAt.Value);
        }

        if (parameters.ToCreatedAt.HasValue)
        {
            query = query.Where(c => c.CreatedAt <= parameters.ToCreatedAt.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var sortBy = string.IsNullOrWhiteSpace(parameters.SortBy)
            ? "createdAt"
            : parameters.SortBy.Trim();
        var descending = !string.Equals(parameters.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);

        query = ApplyAdminSorting(query, sortBy, descending);

        var comments = await query
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync(cancellationToken);

        return new AdminCommentsResult
        {
            Items = comments.Select(MapToAdminDto).ToList(),
            TotalCount = totalCount
        };
    }

    private static IQueryable<Comment> ApplyAdminSorting(
        IQueryable<Comment> query,
        string sortBy,
        bool descending)
    {
        return sortBy.ToLowerInvariant() switch
        {
            "updatedat" when descending => query.OrderByDescending(c => c.UpdatedAt),
            "updatedat" => query.OrderBy(c => c.UpdatedAt),
            "deletedat" when descending => query.OrderByDescending(c => c.DeletedAt),
            "deletedat" => query.OrderBy(c => c.DeletedAt),
            "authoruserid" when descending => query.OrderByDescending(c => c.UserId),
            "authoruserid" => query.OrderBy(c => c.UserId),
            "postid" when descending => query.OrderByDescending(c => c.PostId),
            "postid" => query.OrderBy(c => c.PostId),
            "createdat" when descending => query.OrderByDescending(c => c.CreatedAt),
            "createdat" => query.OrderBy(c => c.CreatedAt),
            _ when descending => query.OrderByDescending(c => c.CreatedAt),
            _ => query.OrderBy(c => c.CreatedAt)
        };
    }

    private static AdminCommentDto MapToAdminDto(Comment comment) =>
        new()
        {
            Id = comment.Id,
            PostId = comment.PostId,
            AuthorUserId = comment.UserId,
            ParentCommentId = comment.ParentCommentId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt,
            DeletedAt = comment.DeletedAt,
            IsDeleted = comment.DeletedAt != null
        };

    private static CommentResult Success(Comment comment)
    {
        return new CommentResult
        {
            Succeeded = true,
            Comment = MapToDto(comment)
        };
    }

    private static CommentResult Error(string message)
    {
        return new CommentResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static CommentResult PostNotFound()
    {
        return new CommentResult
        {
            Succeeded = false,
            Errors = new[] { "Post not found." }
        };
    }

    private static CommentResult CommentNotFound()
    {
        return new CommentResult
        {
            Succeeded = false,
            Errors = new[] { "Comment not found." }
        };
    }

    private static CommentDto MapToDto(Comment comment)
    {
        return new CommentDto
        {
            Id = comment.Id,
            PostId = comment.PostId,
            UserId = comment.UserId,
            ParentCommentId = comment.ParentCommentId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }
}
