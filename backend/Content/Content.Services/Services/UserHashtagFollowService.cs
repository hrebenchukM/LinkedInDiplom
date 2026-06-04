using Content.Contracts.DTOs;
using Content.Contracts.Parameters.UserHashtagFollow;
using Content.Contracts.Results;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.Services.Services;

// Сервис подписок пользователя на хэштеги
public class UserHashtagFollowService : IUserHashtagFollowService
{
    private readonly ContentDbContext _dbContext;

    public UserHashtagFollowService(ContentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserHashtagFollowResult> FollowAsync(FollowHashtagParameters parameters)
    {
        var hashtagExists = await _dbContext.Hashtags
            .AsNoTracking()
            .AnyAsync(h => h.Id == parameters.HashtagId);

        if (!hashtagExists)
        {
            return HashtagNotFound();
        }

        var existing = await _dbContext.UserHashtagFollows
            .FirstOrDefaultAsync(f =>
                f.UserId == parameters.UserId &&
                f.HashtagId == parameters.HashtagId);

        if (existing != null)
        {
            if (existing.UnfollowedAt == null)
            {
                return Error("Already following this hashtag.");
            }

            var now = DateTime.UtcNow;
            existing.UnfollowedAt = null;
            existing.FollowedAt = now;

            await _dbContext.SaveChangesAsync();

            var reactivatedHashtag = await _dbContext.Hashtags
                .AsNoTracking()
                .FirstAsync(h => h.Id == parameters.HashtagId);

            return Success(existing, reactivatedHashtag);
        }

        var follow = new UserHashtagFollow
        {
            Id = Guid.NewGuid(),
            UserId = parameters.UserId,
            HashtagId = parameters.HashtagId,
            FollowedAt = DateTime.UtcNow,
            UnfollowedAt = null
        };

        _dbContext.UserHashtagFollows.Add(follow);
        await _dbContext.SaveChangesAsync();

        var hashtag = await _dbContext.Hashtags
            .AsNoTracking()
            .FirstAsync(h => h.Id == parameters.HashtagId);

        return Success(follow, hashtag);
    }

    public async Task<UserHashtagFollowResult> UnfollowAsync(UnfollowHashtagParameters parameters)
    {
        var follow = await _dbContext.UserHashtagFollows
            .FirstOrDefaultAsync(f =>
                f.UserId == parameters.UserId &&
                f.HashtagId == parameters.HashtagId &&
                f.UnfollowedAt == null);

        if (follow == null)
        {
            return HashtagFollowNotFound();
        }

        follow.UnfollowedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        var hashtag = await _dbContext.Hashtags
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == parameters.HashtagId);

        return Success(follow, hashtag);
    }

    public async Task<IReadOnlyCollection<UserHashtagFollowDto>> GetMyFollowsAsync(GetMyHashtagFollowsParameters parameters)
    {
        var follows = await (
                from follow in _dbContext.UserHashtagFollows.AsNoTracking()
                join hashtag in _dbContext.Hashtags.AsNoTracking() on follow.HashtagId equals hashtag.Id
                where follow.UserId == parameters.UserId && follow.UnfollowedAt == null
                orderby follow.FollowedAt descending
                select new { follow, hashtag })
            .ToListAsync();

        return follows
            .Select(x => MapToDto(x.follow, x.hashtag))
            .ToList();
    }

    private static UserHashtagFollowResult Success(UserHashtagFollow follow, Hashtag? hashtag = null)
    {
        return new UserHashtagFollowResult
        {
            Succeeded = true,
            UserHashtagFollow = MapToDto(follow, hashtag)
        };
    }

    private static UserHashtagFollowResult Error(string message)
    {
        return new UserHashtagFollowResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static UserHashtagFollowResult HashtagNotFound()
    {
        return Error("Hashtag not found.");
    }

    private static UserHashtagFollowResult HashtagFollowNotFound()
    {
        return Error("Hashtag follow not found.");
    }

    private static UserHashtagFollowDto MapToDto(UserHashtagFollow follow, Hashtag? hashtag = null)
    {
        return new UserHashtagFollowDto
        {
            Id = follow.Id,
            UserId = follow.UserId,
            HashtagId = follow.HashtagId,
            FollowedAt = follow.FollowedAt,
            UnfollowedAt = follow.UnfollowedAt,
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
