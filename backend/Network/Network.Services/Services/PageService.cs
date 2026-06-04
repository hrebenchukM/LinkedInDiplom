using Microsoft.EntityFrameworkCore;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.Page;
using Network.Contracts.Results;
using Network.Contracts.Services;
using Network.DataAccess;
using Network.DataAccess.Entities;

namespace Network.Services.Services;

// Сервис страниц
public class PageService : IPageService
{
    private const string RoleOwner = "owner";

    private readonly NetworkDbContext _dbContext;

    public PageService(NetworkDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PageResult> CreateAsync(CreatePageParameters parameters)
    {
        var name = parameters.Name.Trim();

        if (string.IsNullOrEmpty(name))
        {
            return Error("Page name is required.");
        }

        var now = DateTime.UtcNow;

        var page = new Page
        {
            Id = Guid.NewGuid(),
            OwnerId = parameters.OwnerId,
            Name = name,
            Description = parameters.Description,
            LogoUrl = parameters.LogoUrl,
            CreatedAt = now,
            UpdatedAt = null,
            DeletedAt = null
        };

        var ownerAdmin = new PageAdmin
        {
            Id = Guid.NewGuid(),
            PageId = page.Id,
            UserId = parameters.OwnerId,
            Role = RoleOwner,
            AssignedAt = now,
            RevokedAt = null
        };

        _dbContext.Pages.Add(page);
        _dbContext.PageAdmins.Add(ownerAdmin);
        await _dbContext.SaveChangesAsync();

        return Success(page);
    }

    public async Task<IReadOnlyCollection<PageDto>> GetMyPagesAsync(GetMyPagesParameters parameters)
    {
        var pages = await _dbContext.Pages
            .AsNoTracking()
            .Where(p => p.OwnerId == parameters.OwnerId && p.DeletedAt == null)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return pages.Select(MapToDto).ToList();
    }

    public async Task<PageDto?> GetByIdAsync(GetPageByIdParameters parameters)
    {
        if (!await CanAccessPageAsync(parameters.UserId, parameters.PageId))
            return null;

        var page = await _dbContext.Pages
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PageId &&
                p.DeletedAt == null);

        return page == null ? null : MapToDto(page);
    }

    public async Task<PageResult> UpdateAsync(UpdatePageParameters parameters)
    {
        var page = await _dbContext.Pages
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PageId &&
                p.OwnerId == parameters.OwnerId &&
                p.DeletedAt == null);

        if (page == null)
            return NotFound();

        var name = parameters.Name.Trim();

        if (string.IsNullOrEmpty(name))
        {
            return Error("Page name is required.");
        }

        var now = DateTime.UtcNow;
        page.Name = name;
        page.Description = parameters.Description;
        page.LogoUrl = parameters.LogoUrl;
        page.UpdatedAt = now;

        await _dbContext.SaveChangesAsync();

        return Success(page);
    }

    public async Task<PageResult> DeleteAsync(DeletePageParameters parameters)
    {
        var page = await _dbContext.Pages
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PageId &&
                p.OwnerId == parameters.OwnerId &&
                p.DeletedAt == null);

        if (page == null)
            return NotFound();

        var now = DateTime.UtcNow;
        page.DeletedAt = now;
        page.UpdatedAt = now;

        var activeAdmins = await _dbContext.PageAdmins
            .Where(a => a.PageId == parameters.PageId && a.RevokedAt == null)
            .ToListAsync();

        foreach (var admin in activeAdmins)
        {
            admin.RevokedAt = now;
        }

        var activeFollowers = await _dbContext.PageFollowers
            .Where(f => f.PageId == parameters.PageId && f.UnfollowedAt == null)
            .ToListAsync();

        foreach (var follower in activeFollowers)
        {
            follower.UnfollowedAt = now;
        }

        await _dbContext.SaveChangesAsync();

        return Success(page);
    }

    private async Task<bool> CanAccessPageAsync(string userId, Guid pageId)
    {
        var page = await _dbContext.Pages
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == pageId && p.DeletedAt == null);

        if (page == null)
            return false;

        if (page.OwnerId == userId)
            return true;

        var isActiveAdmin = await _dbContext.PageAdmins
            .AsNoTracking()
            .AnyAsync(a =>
                a.PageId == pageId &&
                a.UserId == userId &&
                a.RevokedAt == null);

        if (isActiveAdmin)
            return true;

        return await _dbContext.PageFollowers
            .AsNoTracking()
            .AnyAsync(f =>
                f.PageId == pageId &&
                f.UserId == userId &&
                f.UnfollowedAt == null);
    }

    private static PageResult Success(Page page)
    {
        return new PageResult
        {
            Succeeded = true,
            Page = MapToDto(page)
        };
    }

    private static PageResult Error(string message)
    {
        return new PageResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static PageResult NotFound()
    {
        return new PageResult
        {
            Succeeded = false,
            Errors = new[] { "Page not found." }
        };
    }

    private static PageDto MapToDto(Page page)
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
}
