using Content.Contracts.DTOs;
using Content.Contracts.Parameters.PostMedia;
using Content.Contracts.Results;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.Services.Services;

// Сервис связей поста и медиа
public class PostMediaService : IPostMediaService
{
    private const string VisibilityPrivate = "private";

    private readonly ContentDbContext _dbContext;

    public PostMediaService(ContentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PostMediaResult> AttachAsync(AttachMediaToPostParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.UserId == parameters.AuthorId &&
                p.DeletedAt == null);

        if (post == null)
            return PostNotFound();

        var mediaExists = await _dbContext.Media
            .AsNoTracking()
            .AnyAsync(m => m.Id == parameters.MediaId);

        if (!mediaExists)
            return MediaNotFound();

        var existingLink = await _dbContext.PostMedia
            .AnyAsync(pm =>
                pm.PostId == parameters.PostId &&
                pm.MediaId == parameters.MediaId);

        if (existingLink)
        {
            return Error("Media is already attached to this post.");
        }

        var postMedia = new PostMedia
        {
            Id = Guid.NewGuid(),
            PostId = parameters.PostId,
            MediaId = parameters.MediaId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.PostMedia.Add(postMedia);
        await _dbContext.SaveChangesAsync();

        var media = await _dbContext.Media
            .AsNoTracking()
            .FirstAsync(m => m.Id == parameters.MediaId);

        return Success(postMedia, media);
    }

    public async Task<PostMediaResult> DetachAsync(DetachMediaFromPostParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.UserId == parameters.AuthorId &&
                p.DeletedAt == null);

        if (post == null)
            return PostNotFound();

        var postMedia = await _dbContext.PostMedia
            .FirstOrDefaultAsync(pm =>
                pm.PostId == parameters.PostId &&
                pm.MediaId == parameters.MediaId);

        if (postMedia == null)
            return PostMediaNotFound();

        _dbContext.PostMedia.Remove(postMedia);
        await _dbContext.SaveChangesAsync();

        return Success(postMedia);
    }

    public async Task<IReadOnlyCollection<PostMediaDto>> GetByPostIdAsync(GetPostMediaParameters parameters)
    {
        if (!await CanViewPostAsync(parameters.ViewerUserId, parameters.PostId))
            return Array.Empty<PostMediaDto>();

        var links = await (
                from postMedia in _dbContext.PostMedia.AsNoTracking()
                join media in _dbContext.Media.AsNoTracking() on postMedia.MediaId equals media.Id
                where postMedia.PostId == parameters.PostId
                orderby postMedia.CreatedAt descending
                select new { postMedia, media })
            .ToListAsync();

        return links
            .Select(x => MapToDto(x.postMedia, x.media))
            .ToList();
    }

    private async Task<bool> CanViewPostAsync(string viewerUserId, Guid postId)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == postId && p.DeletedAt == null);

        if (post == null)
            return false;

        if (post.Visibility == VisibilityPrivate && post.UserId != viewerUserId)
            return false;

        return true;
    }

    private static PostMediaResult Success(PostMedia postMedia, Media? media = null)
    {
        return new PostMediaResult
        {
            Succeeded = true,
            PostMedia = MapToDto(postMedia, media)
        };
    }

    private static PostMediaResult Error(string message)
    {
        return new PostMediaResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static PostMediaResult PostNotFound()
    {
        return Error("Post not found.");
    }

    private static PostMediaResult MediaNotFound()
    {
        return Error("Media not found.");
    }

    private static PostMediaResult PostMediaNotFound()
    {
        return Error("Post media not found.");
    }

    private static PostMediaDto MapToDto(PostMedia postMedia, Media? media = null)
    {
        return new PostMediaDto
        {
            Id = postMedia.Id,
            PostId = postMedia.PostId,
            MediaId = postMedia.MediaId,
            CreatedAt = postMedia.CreatedAt,
            Media = media == null ? null : MapMediaToDto(media)
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
