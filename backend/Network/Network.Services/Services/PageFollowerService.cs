using Microsoft.EntityFrameworkCore;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.PageFollower;
using Network.Contracts.Results;
using Network.Contracts.Services;
using Network.DataAccess;
using Network.DataAccess.Entities;

namespace Network.Services.Services;

// Сервис подписчиков страниц
public class PageFollowerService : IPageFollowerService
{
    private readonly NetworkDbContext _dbContext;

    public PageFollowerService(NetworkDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PageFollowerResult> FollowPageAsync(FollowPageParameters parameters)
    {
        var pageExists = await _dbContext.Pages
            .AsNoTracking()
            .AnyAsync(p =>
                p.Id == parameters.PageId &&
                p.DeletedAt == null);

        if (!pageExists)
        {
            return new PageFollowerResult
            {
                Succeeded = false,
                Errors = new[] { "Page not found." }
            };
        }

        var existing = await _dbContext.PageFollowers
            .FirstOrDefaultAsync(f =>
                f.PageId == parameters.PageId &&
                f.UserId == parameters.UserId);

        if (existing != null)
        {
            if (existing.UnfollowedAt == null)
            {
                return Error("Already following this page.");
            }

            var now = DateTime.UtcNow;
            existing.UnfollowedAt = null;
            existing.FollowedAt = now;

            await _dbContext.SaveChangesAsync();

            return Success(existing);
        }

        var follower = new PageFollower
        {
            Id = Guid.NewGuid(),
            PageId = parameters.PageId,
            UserId = parameters.UserId,
            FollowedAt = DateTime.UtcNow,
            UnfollowedAt = null
        };

        _dbContext.PageFollowers.Add(follower);
        await _dbContext.SaveChangesAsync();

        return Success(follower);
    }

    public async Task<PageFollowerResult> UnfollowPageAsync(UnfollowPageParameters parameters)
    {
        var follower = await _dbContext.PageFollowers
            .FirstOrDefaultAsync(f =>
                f.PageId == parameters.PageId &&
                f.UserId == parameters.UserId &&
                f.UnfollowedAt == null);

        if (follower == null)
        {
            return new PageFollowerResult
            {
                Succeeded = false,
                Errors = new[] { "Page follow not found." }
            };
        }

        follower.UnfollowedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Success(follower);
    }

    public async Task<IReadOnlyCollection<PageDto>> GetMyFollowedPagesAsync(
        GetMyFollowedPagesParameters parameters)
    {
        var pages = await (
                from follower in _dbContext.PageFollowers.AsNoTracking()
                join page in _dbContext.Pages.AsNoTracking() on follower.PageId equals page.Id
                where follower.UserId == parameters.UserId &&
                      follower.UnfollowedAt == null &&
                      page.DeletedAt == null
                orderby follower.FollowedAt descending
                select page)
            .ToListAsync();

        return pages.Select(MapPageToDto).ToList();
    }

    public async Task<IReadOnlyCollection<PageFollowerDto>> GetPageFollowersAsync(
        GetPageFollowersParameters parameters)
    {
        if (!await CanViewPageFollowersAsync(parameters.UserId, parameters.PageId))
            return Array.Empty<PageFollowerDto>();

        var followers = await _dbContext.PageFollowers
            .AsNoTracking()
            .Where(f => f.PageId == parameters.PageId && f.UnfollowedAt == null)
            .OrderByDescending(f => f.FollowedAt)
            .ToListAsync();

        return followers.Select(MapFollowerToDto).ToList();
    }

    private async Task<bool> CanViewPageFollowersAsync(string userId, Guid pageId)
    {
        var page = await _dbContext.Pages
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == pageId && p.DeletedAt == null);

        if (page == null)
            return false;

        if (page.OwnerId == userId)
            return true;

        return await _dbContext.PageAdmins
            .AsNoTracking()
            .AnyAsync(a =>
                a.PageId == pageId &&
                a.UserId == userId &&
                a.RevokedAt == null);
    }

    private static PageFollowerResult Success(PageFollower follower)
    {
        return new PageFollowerResult
        {
            Succeeded = true,
            PageFollower = MapFollowerToDto(follower)
        };
    }

    private static PageFollowerResult Error(string message)
    {
        return new PageFollowerResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static PageDto MapPageToDto(Page page)
    {
        return new PageDto
        {
            Id = page.Id,
            OwnerId = page.OwnerId,
            Name = page.Name,
            Description = page.Description,
            LogoUrl = page.LogoUrl,
            CreatedAt = page.CreatedAt,
            UpdatedAt = page.UpdatedAt
        };
    }

    private static PageFollowerDto MapFollowerToDto(PageFollower follower)
    {
        return new PageFollowerDto
        {
            Id = follower.Id,
            PageId = follower.PageId,
            UserId = follower.UserId,
            FollowedAt = follower.FollowedAt,
            UnfollowedAt = follower.UnfollowedAt
        };
    }
}
