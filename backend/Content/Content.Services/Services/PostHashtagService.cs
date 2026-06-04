using Content.Contracts.DTOs;
using Content.Contracts.Parameters.PostHashtag;
using Content.Contracts.Results;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.Services.Services;

// Сервис связей поста и хэштегов
public class PostHashtagService : IPostHashtagService
{
    private const string VisibilityPrivate = "private";

    private readonly ContentDbContext _dbContext;

    public PostHashtagService(ContentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PostHashtagResult> AttachAsync(AttachHashtagToPostParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.UserId == parameters.AuthorId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return PostNotFound();
        }

        var hashtag = await _dbContext.Hashtags
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == parameters.HashtagId);

        if (hashtag == null)
        {
            return HashtagNotFound();
        }

        var existingLink = await _dbContext.PostHashtags
            .AnyAsync(ph =>
                ph.PostId == parameters.PostId &&
                ph.HashtagId == parameters.HashtagId);

        if (existingLink)
        {
            return Error("Post hashtag already exists.");
        }

        var postHashtag = new PostHashtag
        {
            Id = Guid.NewGuid(),
            PostId = parameters.PostId,
            HashtagId = parameters.HashtagId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.PostHashtags.Add(postHashtag);
        await _dbContext.SaveChangesAsync();

        return Success(postHashtag, hashtag);
    }

    public async Task<PostHashtagResult> DetachAsync(DetachHashtagFromPostParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.UserId == parameters.AuthorId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return PostNotFound();
        }

        var postHashtag = await _dbContext.PostHashtags
            .FirstOrDefaultAsync(ph =>
                ph.PostId == parameters.PostId &&
                ph.HashtagId == parameters.HashtagId);

        if (postHashtag == null)
        {
            return PostHashtagNotFound();
        }

        _dbContext.PostHashtags.Remove(postHashtag);
        await _dbContext.SaveChangesAsync();

        return Success(postHashtag);
    }

    public async Task<IReadOnlyCollection<PostHashtagDto>> GetByPostIdAsync(GetPostHashtagsParameters parameters)
    {
        var post = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PostId &&
                p.DeletedAt == null);

        if (post == null)
        {
            return Array.Empty<PostHashtagDto>();
        }

        if (post.Visibility == VisibilityPrivate && post.UserId != parameters.ViewerUserId)
        {
            return Array.Empty<PostHashtagDto>();
        }

        var links = await (
                from postHashtag in _dbContext.PostHashtags.AsNoTracking()
                join hashtag in _dbContext.Hashtags.AsNoTracking() on postHashtag.HashtagId equals hashtag.Id
                where postHashtag.PostId == parameters.PostId
                orderby postHashtag.CreatedAt descending
                select new { postHashtag, hashtag })
            .ToListAsync();

        return links
            .Select(x => MapToDto(x.postHashtag, x.hashtag))
            .ToList();
    }

    private static PostHashtagResult Success(PostHashtag postHashtag, Hashtag? hashtag = null)
    {
        return new PostHashtagResult
        {
            Succeeded = true,
            PostHashtag = MapToDto(postHashtag, hashtag)
        };
    }

    private static PostHashtagResult Error(string message)
    {
        return new PostHashtagResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static PostHashtagResult PostNotFound()
    {
        return Error("Post not found.");
    }

    private static PostHashtagResult HashtagNotFound()
    {
        return Error("Hashtag not found.");
    }

    private static PostHashtagResult PostHashtagNotFound()
    {
        return Error("Post hashtag not found.");
    }

    private static PostHashtagDto MapToDto(PostHashtag postHashtag, Hashtag? hashtag = null)
    {
        return new PostHashtagDto
        {
            Id = postHashtag.Id,
            PostId = postHashtag.PostId,
            HashtagId = postHashtag.HashtagId,
            CreatedAt = postHashtag.CreatedAt,
            Hashtag = hashtag == null ? null : MapHashtagToDto(hashtag)
        };
    }

    private static HashtagDto MapHashtagToDto(Hashtag hashtag)
    {
        return new HashtagDto
        {
            Id = hashtag.Id,
            Name = hashtag.Name,
            CreatedAt = hashtag.CreatedAt,
            UpdatedAt = hashtag.UpdatedAt
        };
    }
}
