using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Post;
using Content.Contracts.Results;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.Services.Services;

/// <summary>
/// Core service модуля Content для постов.
/// Хранит бизнес-логику постов: visibility, ownership, media attach и soft delete.
/// </summary>
public class PostService : IPostService
{
    private const string VisibilityPublic = "public";
    private const string VisibilityPrivate = "private";

    private readonly ContentDbContext _dbContext;

    public PostService(ContentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PostResult> CreateAsync(CreatePostParameters parameters)
    {
        var content = parameters.Content.Trim();

        if (string.IsNullOrEmpty(content))
        {
            return Error("Post content is required.");
        }

        if (!TryNormalizeVisibility(parameters.Visibility, out var visibility, out var visibilityError))
        {
            return Error(visibilityError!);
        }

        var now = DateTime.UtcNow;

        var post = new Post
        {
            Id = Guid.NewGuid(),
            UserId = parameters.AuthorId,
            Content = content,
            Visibility = visibility,
            ReactionCount = 0,
            CommentCount = 0,
            RepostCount = 0,
            CreatedAt = now,
            EditedAt = null,
            DeletedAt = null
        };

        _dbContext.Posts.Add(post);

        if (parameters.MediaIds is { Count: > 0 })
        {
            var distinctMediaIds = parameters.MediaIds.Distinct().ToList();
            var existingMediaCount = await _dbContext.Media
                .CountAsync(m => distinctMediaIds.Contains(m.Id));

            if (existingMediaCount != distinctMediaIds.Count)
            {
                return Error("Media not found.");
            }

            foreach (var mediaId in distinctMediaIds)
            {
                _dbContext.PostMedia.Add(new PostMedia
                {
                    Id = Guid.NewGuid(),
                    PostId = post.Id,
                    MediaId = mediaId,
                    CreatedAt = now
                });
            }
        }

        await _dbContext.SaveChangesAsync();

        var media = await GetMediaForPostAsync(post.Id);

        return Success(post, media);
    }

    public async Task<MyPostsResult> GetMyPostsAsync(GetMyPostsParameters parameters)
    {
        var query = _dbContext.Posts
            .AsNoTracking()
            .Where(p => p.UserId == parameters.AuthorId && p.DeletedAt == null);

        var totalCount = await query.CountAsync();

        var posts = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync();

        var mediaByPostId = await GetMediaByPostIdsAsync(posts.Select(p => p.Id));

        var items = posts
            .Select(p => MapToDto(p, mediaByPostId.GetValueOrDefault(p.Id)))
            .ToList();

        return new MyPostsResult
        {
            Items = items,
            TotalCount = totalCount
        };
    }

    public async Task<MyPostsResult> GetUserPublicPostsAsync(GetUserPublicPostsParameters parameters)
    {
        var query = _dbContext.Posts
            .AsNoTracking()
            .Where(p =>
                p.UserId == parameters.AuthorUserId &&
                p.DeletedAt == null &&
                p.Visibility == VisibilityPublic);

        var totalCount = await query.CountAsync();

        var posts = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync();

        var mediaByPostId = await GetMediaByPostIdsAsync(posts.Select(p => p.Id));

        var items = posts
            .Select(p => MapToDto(p, mediaByPostId.GetValueOrDefault(p.Id)))
            .ToList();

        return new MyPostsResult
        {
            Items = items,
            TotalCount = totalCount
        };
    }

    public async Task<FeedPostsResult> GetFeedPostsAsync(GetFeedPostsParameters parameters)
    {
        var query = _dbContext.Posts
            .AsNoTracking()
            .Where(p => p.DeletedAt == null);

        if (parameters.AuthorUserIds is { Count: > 0 })
        {
            var authorIds = parameters.AuthorUserIds;
            var viewerUserId = parameters.ViewerUserId;

            query = query.Where(p =>
                authorIds.Contains(p.UserId) &&
                (p.Visibility == VisibilityPublic ||
                 (p.Visibility == VisibilityPrivate && p.UserId == viewerUserId)));
        }
        else
        {
            query = query.Where(p => p.Visibility == VisibilityPublic);
        }

        var totalCount = await query.CountAsync();

        var posts = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync();

        var mediaByPostId = await GetMediaByPostIdsAsync(posts.Select(p => p.Id));

        var items = posts
            .Select(p => MapToDto(p, mediaByPostId.GetValueOrDefault(p.Id)))
            .ToList();

        return new FeedPostsResult
        {
            Items = items,
            TotalCount = totalCount
        };
    }

    public async Task<PostDto?> GetByIdAsync(GetPostByIdParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null)
            return null;

        if (post.Visibility == VisibilityPrivate && post.UserId != parameters.ViewerUserId)
            return null;

        var media = await GetMediaForPostAsync(post.Id);

        return MapToDto(post, media);
    }

    public async Task<PostResult> UpdateAsync(UpdatePostParameters parameters)
    {
        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.UserId == parameters.AuthorId &&
                p.DeletedAt == null);

        if (post == null)
            return NotFound();

        var content = parameters.Content.Trim();

        if (string.IsNullOrEmpty(content))
        {
            return Error("Post content is required.");
        }

        if (!TryNormalizeVisibility(parameters.Visibility, out var visibility, out var visibilityError))
        {
            return Error(visibilityError!);
        }

        var now = DateTime.UtcNow;
        post.Content = content;
        post.Visibility = visibility;
        post.EditedAt = now;

        await _dbContext.SaveChangesAsync();

        var media = await GetMediaForPostAsync(post.Id);

        return Success(post, media);
    }

    public async Task<PostResult> DeleteAsync(DeletePostParameters parameters)
    {
        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.UserId == parameters.AuthorId &&
                p.DeletedAt == null);

        if (post == null)
            return NotFound();

        var now = DateTime.UtcNow;
        post.DeletedAt = now;
        post.EditedAt = now;

        await _dbContext.SaveChangesAsync();

        var media = await GetMediaForPostAsync(post.Id);

        return Success(post, media);
    }

    public async Task AdminSoftDeletePostAsync(
        Guid postId,
        CancellationToken cancellationToken = default)
    {
        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p => p.Id == postId, cancellationToken);

        if (post == null)
        {
            throw new InvalidOperationException($"Post with id '{postId}' was not found.");
        }

        if (post.DeletedAt != null)
        {
            return;
        }

        post.DeletedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AdminRestorePostAsync(
        Guid postId,
        CancellationToken cancellationToken = default)
    {
        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p => p.Id == postId, cancellationToken);

        if (post == null)
        {
            throw new InvalidOperationException($"Post with id '{postId}' was not found.");
        }

        if (post.DeletedAt == null)
        {
            return;
        }

        post.DeletedAt = null;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<AdminPostsResult> GetAdminPostsAsync(
        GetAdminPostsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Posts.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(parameters.AuthorId))
        {
            query = query.Where(p => p.UserId == parameters.AuthorId.Trim());
        }

        if (parameters.IsDeleted == true)
        {
            query = query.Where(p => p.DeletedAt != null);
        }
        else if (parameters.IsDeleted == false)
        {
            query = query.Where(p => p.DeletedAt == null);
        }
        else if (parameters.IncludeDeleted == false)
        {
            query = query.Where(p => p.DeletedAt == null);
        }

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var searchPattern = $"%{parameters.Search.Trim()}%";
            query = query.Where(p => EF.Functions.ILike(p.Content, searchPattern));
        }

        if (parameters.CreatedFrom.HasValue)
        {
            query = query.Where(p => p.CreatedAt >= parameters.CreatedFrom.Value);
        }

        if (parameters.CreatedTo.HasValue)
        {
            query = query.Where(p => p.CreatedAt <= parameters.CreatedTo.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var sortBy = string.IsNullOrWhiteSpace(parameters.SortBy)
            ? "createdAt"
            : parameters.SortBy.Trim();
        var descending = !string.Equals(parameters.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);

        query = ApplyAdminSorting(query, sortBy, descending);

        var posts = await query
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync(cancellationToken);

        var mediaCounts = await GetMediaCountsByPostIdsAsync(
            posts.Select(p => p.Id),
            cancellationToken);

        var items = posts
            .Select(p => MapToAdminDto(p, mediaCounts.GetValueOrDefault(p.Id)))
            .ToList();

        return new AdminPostsResult
        {
            Items = items,
            TotalCount = totalCount
        };
    }

    public async Task<ContentStatsDto> GetContentStatsAsync(
        CancellationToken cancellationToken = default)
    {
        var totalPosts = await _dbContext.Posts.CountAsync(cancellationToken);
        var deletedPosts = await _dbContext.Posts.CountAsync(
            p => p.DeletedAt != null,
            cancellationToken);

        return new ContentStatsDto
        {
            TotalPosts = totalPosts,
            DeletedPosts = deletedPosts,
            ActivePosts = totalPosts - deletedPosts
        };
    }

    private async Task<IReadOnlyCollection<MediaDto>> GetMediaForPostAsync(Guid postId)
    {
        var media = await (
                from postMedia in _dbContext.PostMedia.AsNoTracking()
                join item in _dbContext.Media.AsNoTracking() on postMedia.MediaId equals item.Id
                where postMedia.PostId == postId
                orderby postMedia.CreatedAt descending
                select item)
            .ToListAsync();

        return media.Select(MapMediaToDto).ToList();
    }

    private async Task<IReadOnlyDictionary<Guid, int>> GetMediaCountsByPostIdsAsync(
        IEnumerable<Guid> postIds,
        CancellationToken cancellationToken = default)
    {
        var ids = postIds.Distinct().ToList();

        if (ids.Count == 0)
        {
            return new Dictionary<Guid, int>();
        }

        return await _dbContext.PostMedia
            .AsNoTracking()
            .Where(pm => ids.Contains(pm.PostId))
            .GroupBy(pm => pm.PostId)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PostId, x => x.Count, cancellationToken);
    }

    private static IQueryable<Post> ApplyAdminSorting(
        IQueryable<Post> query,
        string sortBy,
        bool descending)
    {
        return sortBy.ToLowerInvariant() switch
        {
            "updatedat" when descending => query.OrderByDescending(p => p.EditedAt),
            "updatedat" => query.OrderBy(p => p.EditedAt),
            "authorid" when descending => query.OrderByDescending(p => p.UserId),
            "authorid" => query.OrderBy(p => p.UserId),
            "deletedat" when descending => query.OrderByDescending(p => p.DeletedAt),
            "deletedat" => query.OrderBy(p => p.DeletedAt),
            "createdat" when descending => query.OrderByDescending(p => p.CreatedAt),
            "createdat" => query.OrderBy(p => p.CreatedAt),
            _ when descending => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderBy(p => p.CreatedAt)
        };
    }

    private async Task<IReadOnlyDictionary<Guid, IReadOnlyCollection<MediaDto>>> GetMediaByPostIdsAsync(
        IEnumerable<Guid> postIds)
    {
        var ids = postIds.Distinct().ToList();

        if (ids.Count == 0)
            return new Dictionary<Guid, IReadOnlyCollection<MediaDto>>();

        var rows = await (
                from postMedia in _dbContext.PostMedia.AsNoTracking()
                join item in _dbContext.Media.AsNoTracking() on postMedia.MediaId equals item.Id
                where ids.Contains(postMedia.PostId)
                orderby postMedia.CreatedAt descending
                select new { postMedia.PostId, Media = item })
            .ToListAsync();

        return rows
            .GroupBy(x => x.PostId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyCollection<MediaDto>)g.Select(x => MapMediaToDto(x.Media)).ToList());
    }

    private static bool TryNormalizeVisibility(
        string? visibility,
        out string normalized,
        out string? error)
    {
        var value = string.IsNullOrWhiteSpace(visibility)
            ? VisibilityPublic
            : visibility.Trim().ToLowerInvariant();

        if (value is not (VisibilityPublic or VisibilityPrivate))
        {
            normalized = default!;
            error = "Invalid visibility.";
            return false;
        }

        normalized = value;
        error = null;
        return true;
    }

    private static PostResult Success(Post post, IReadOnlyCollection<MediaDto>? media = null)
    {
        return new PostResult
        {
            Succeeded = true,
            Post = MapToDto(post, media)
        };
    }

    private static PostResult Error(string message)
    {
        return new PostResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static PostResult NotFound()
    {
        return new PostResult
        {
            Succeeded = false,
            Errors = new[] { "Post not found." }
        };
    }

    private static PostDto MapToDto(Post post, IReadOnlyCollection<MediaDto>? media = null)
    {
        return new PostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            Content = post.Content,
            Visibility = post.Visibility,
            ReactionCount = post.ReactionCount,
            CommentCount = post.CommentCount,
            RepostCount = post.RepostCount,
            CreatedAt = post.CreatedAt,
            EditedAt = post.EditedAt,
            Media = media
        };
    }

    private static AdminPostDto MapToAdminDto(Post post, int mediaCount)
    {
        return new AdminPostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            Content = post.Content,
            Visibility = post.Visibility,
            ReactionCount = post.ReactionCount,
            CommentCount = post.CommentCount,
            RepostCount = post.RepostCount,
            MediaCount = mediaCount,
            CreatedAt = post.CreatedAt,
            EditedAt = post.EditedAt,
            DeletedAt = post.DeletedAt,
            IsDeleted = post.DeletedAt != null
        };
    }

    private static MediaDto MapMediaToDto(Media media)
    {
        return new MediaDto
        {
            Id = media.Id,
            Url = media.Url,
            Type = media.Type,
            CreatedAt = media.CreatedAt
        };
    }
}
