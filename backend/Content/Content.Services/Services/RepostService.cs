using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Repost;
using Content.Contracts.Results;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.Services.Services;

// Сервис репостов
public class RepostService : IRepostService
{
    private const string VisibilityPrivate = "private";

    private readonly ContentDbContext _dbContext;

    public RepostService(ContentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<RepostResult> RepostAsync(RepostPostParameters parameters)
    {
        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.OriginalPostId &&
                p.DeletedAt == null);

        if (post == null || !CanViewPost(post, parameters.UserId))
        {
            return PostNotFound();
        }

        if (post.UserId == parameters.UserId)
        {
            return Error("Cannot repost your own post.");
        }

        var existing = await _dbContext.Reposts
            .FirstOrDefaultAsync(r =>
                r.UserId == parameters.UserId &&
                r.OriginalPostId == parameters.OriginalPostId);

        if (existing != null)
        {
            if (existing.RemovedAt == null)
            {
                return Error("Post already reposted.");
            }

            var now = DateTime.UtcNow;
            existing.RemovedAt = null;
            existing.RepostedAt = now;
            post.RepostCount += 1;

            await _dbContext.SaveChangesAsync();

            var media = await GetMediaForPostAsync(post.Id);

            return Success(existing, post, media);
        }

        var repost = new Repost
        {
            Id = Guid.NewGuid(),
            UserId = parameters.UserId,
            OriginalPostId = parameters.OriginalPostId,
            RepostedAt = DateTime.UtcNow,
            RemovedAt = null
        };

        _dbContext.Reposts.Add(repost);
        post.RepostCount += 1;

        await _dbContext.SaveChangesAsync();

        var originalMedia = await GetMediaForPostAsync(post.Id);

        return Success(repost, post, originalMedia);
    }

    public async Task<RepostResult> UnrepostAsync(UnrepostPostParameters parameters)
    {
        var repost = await _dbContext.Reposts
            .FirstOrDefaultAsync(r =>
                r.UserId == parameters.UserId &&
                r.OriginalPostId == parameters.OriginalPostId &&
                r.RemovedAt == null);

        if (repost == null)
        {
            return RepostNotFound();
        }

        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.OriginalPostId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return PostNotFound();
        }

        repost.RemovedAt = DateTime.UtcNow;
        post.RepostCount = Math.Max(0, post.RepostCount - 1);

        await _dbContext.SaveChangesAsync();

        return Success(repost);
    }

    public async Task<IReadOnlyCollection<RepostDto>> GetMyRepostsAsync(GetMyRepostsParameters parameters)
    {
        var links = await (
                from repost in _dbContext.Reposts.AsNoTracking()
                join post in _dbContext.Posts.AsNoTracking() on repost.OriginalPostId equals post.Id
                where repost.UserId == parameters.UserId &&
                      repost.RemovedAt == null &&
                      post.DeletedAt == null
                orderby repost.RepostedAt descending
                select new { repost, post })
            .ToListAsync();

        var mediaByPostId = await GetMediaByPostIdsAsync(links.Select(x => x.post.Id));

        return links
            .Select(x => MapToDto(
                x.repost,
                x.post,
                mediaByPostId.GetValueOrDefault(x.post.Id)))
            .ToList();
    }

    public async Task<IReadOnlyCollection<RepostDto>> GetByPostIdAsync(GetRepostsByPostParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return Array.Empty<RepostDto>();
        }

        if (post.Visibility == VisibilityPrivate && post.UserId != parameters.ViewerUserId)
        {
            return Array.Empty<RepostDto>();
        }

        var reposts = await _dbContext.Reposts
            .AsNoTracking()
            .Where(r =>
                r.OriginalPostId == parameters.PostId &&
                r.RemovedAt == null)
            .OrderByDescending(r => r.RepostedAt)
            .ToListAsync();

        return reposts.Select(r => MapToDto(r)).ToList();
    }

    private static bool CanViewPost(Post post, string userId)
    {
        if (post.Visibility == VisibilityPrivate && post.UserId != userId)
        {
            return false;
        }

        return true;
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

    private async Task<IReadOnlyDictionary<Guid, IReadOnlyCollection<MediaDto>>> GetMediaByPostIdsAsync(
        IEnumerable<Guid> postIds)
    {
        var ids = postIds.Distinct().ToList();

        if (ids.Count == 0)
        {
            return new Dictionary<Guid, IReadOnlyCollection<MediaDto>>();
        }

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

    private static RepostResult Success(Repost repost, Post? originalPost = null, IReadOnlyCollection<MediaDto>? media = null)
    {
        return new RepostResult
        {
            Succeeded = true,
            Repost = MapToDto(repost, originalPost, media)
        };
    }

    private static RepostResult Error(string message)
    {
        return new RepostResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static RepostResult PostNotFound()
    {
        return Error("Post not found.");
    }

    private static RepostResult RepostNotFound()
    {
        return Error("Repost not found.");
    }

    private static RepostDto MapToDto(
        Repost repost,
        Post? originalPost = null,
        IReadOnlyCollection<MediaDto>? media = null)
    {
        return new RepostDto
        {
            Id = repost.Id,
            UserId = repost.UserId,
            OriginalPostId = repost.OriginalPostId,
            RepostedAt = repost.RepostedAt,
            RemovedAt = repost.RemovedAt,
            OriginalPost = originalPost == null ? null : MapPostToDto(originalPost, media)
        };
    }

    private static PostDto MapPostToDto(Post post, IReadOnlyCollection<MediaDto>? media = null)
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
