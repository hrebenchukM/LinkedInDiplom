using Content.Contracts.DTOs;
using Content.Contracts.Parameters.SavedPost;
using Content.Contracts.Results;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.Services.Services;

// Сервис сохранённых постов
public class SavedPostService : ISavedPostService
{
    private const string VisibilityPrivate = "private";

    private readonly ContentDbContext _dbContext;

    public SavedPostService(ContentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SavedPostResult> SaveAsync(SavePostParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null || !CanViewPost(post, parameters.UserId))
        {
            return PostNotFound();
        }

        var existing = await _dbContext.SavedPosts
            .FirstOrDefaultAsync(s =>
                s.UserId == parameters.UserId &&
                s.PostId == parameters.PostId);

        if (existing != null)
        {
            if (existing.UnsavedAt == null)
            {
                return Error("Post already saved.");
            }

            var now = DateTime.UtcNow;
            existing.UnsavedAt = null;
            existing.SavedAt = now;

            await _dbContext.SaveChangesAsync();

            var reactivatedPost = await _dbContext.Posts
                .AsNoTracking()
                .FirstAsync(p => p.Id == parameters.PostId);

            var media = await GetMediaForPostAsync(parameters.PostId);

            return Success(existing, reactivatedPost, media);
        }

        var savedPost = new SavedPost
        {
            Id = Guid.NewGuid(),
            UserId = parameters.UserId,
            PostId = parameters.PostId,
            SavedAt = DateTime.UtcNow,
            UnsavedAt = null
        };

        _dbContext.SavedPosts.Add(savedPost);
        await _dbContext.SaveChangesAsync();

        var savedPostEntity = await _dbContext.Posts
            .AsNoTracking()
            .FirstAsync(p => p.Id == parameters.PostId);

        var postMedia = await GetMediaForPostAsync(parameters.PostId);

        return Success(savedPost, savedPostEntity, postMedia);
    }

    public async Task<SavedPostResult> UnsaveAsync(UnsavePostParameters parameters)
    {
        var savedPost = await _dbContext.SavedPosts
            .FirstOrDefaultAsync(s =>
                s.UserId == parameters.UserId &&
                s.PostId == parameters.PostId &&
                s.UnsavedAt == null);

        if (savedPost == null)
        {
            return SavedPostNotFound();
        }

        savedPost.UnsavedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Success(savedPost);
    }

    public async Task<IReadOnlyCollection<SavedPostDto>> GetMySavedPostsAsync(GetMySavedPostsParameters parameters)
    {
        var links = await (
                from savedPost in _dbContext.SavedPosts.AsNoTracking()
                join post in _dbContext.Posts.AsNoTracking() on savedPost.PostId equals post.Id
                where savedPost.UserId == parameters.UserId &&
                      savedPost.UnsavedAt == null &&
                      post.DeletedAt == null
                orderby savedPost.SavedAt descending
                select new { savedPost, post })
            .ToListAsync();

        var mediaByPostId = await GetMediaByPostIdsAsync(links.Select(x => x.post.Id));

        return links
            .Select(x => MapToDto(
                x.savedPost,
                x.post,
                mediaByPostId.GetValueOrDefault(x.post.Id)))
            .ToList();
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

    private static SavedPostResult Success(SavedPost savedPost, Post? post = null, IReadOnlyCollection<MediaDto>? media = null)
    {
        return new SavedPostResult
        {
            Succeeded = true,
            SavedPost = MapToDto(savedPost, post, media)
        };
    }

    private static SavedPostResult Error(string message)
    {
        return new SavedPostResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static SavedPostResult PostNotFound()
    {
        return Error("Post not found.");
    }

    private static SavedPostResult SavedPostNotFound()
    {
        return Error("Saved post not found.");
    }

    private static SavedPostDto MapToDto(
        SavedPost savedPost,
        Post? post = null,
        IReadOnlyCollection<MediaDto>? media = null)
    {
        return new SavedPostDto
        {
            Id = savedPost.Id,
            UserId = savedPost.UserId,
            PostId = savedPost.PostId,
            SavedAt = savedPost.SavedAt,
            UnsavedAt = savedPost.UnsavedAt,
            Post = post == null ? null : MapPostToDto(post, media)
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
