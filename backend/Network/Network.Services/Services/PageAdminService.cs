using Microsoft.EntityFrameworkCore;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.PageAdmin;
using Network.Contracts.Results;
using Network.Contracts.Services;
using Network.DataAccess;
using Network.DataAccess.Entities;

namespace Network.Services.Services;

// Сервис администраторов страниц
public class PageAdminService : IPageAdminService
{
    private const string RoleOwner = "owner";
    private const string RoleAdmin = "admin";

    private readonly NetworkDbContext _dbContext;

    public PageAdminService(NetworkDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PageAdminResult> AddAdminAsync(AddPageAdminParameters parameters)
    {
        var page = await _dbContext.Pages
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PageId &&
                p.OwnerId == parameters.OwnerId &&
                p.DeletedAt == null);

        if (page == null)
        {
            return new PageAdminResult
            {
                Succeeded = false,
                Errors = new[] { "Page not found." }
            };
        }

        if (parameters.UserId == page.OwnerId)
        {
            return Error("Page owner cannot be added as admin.");
        }

        var existing = await _dbContext.PageAdmins
            .FirstOrDefaultAsync(a =>
                a.PageId == parameters.PageId &&
                a.UserId == parameters.UserId);

        if (existing != null)
        {
            if (existing.RevokedAt == null)
            {
                return Error("Page admin already exists.");
            }

            var now = DateTime.UtcNow;
            existing.RevokedAt = null;
            existing.Role = RoleAdmin;
            existing.AssignedAt = now;

            await _dbContext.SaveChangesAsync();

            return Success(existing);
        }

        var admin = new PageAdmin
        {
            Id = Guid.NewGuid(),
            PageId = parameters.PageId,
            UserId = parameters.UserId,
            Role = RoleAdmin,
            AssignedAt = DateTime.UtcNow,
            RevokedAt = null
        };

        _dbContext.PageAdmins.Add(admin);
        await _dbContext.SaveChangesAsync();

        return Success(admin);
    }

    public async Task<PageAdminResult> RemoveAdminAsync(RemovePageAdminParameters parameters)
    {
        var page = await _dbContext.Pages
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.Id == parameters.PageId &&
                p.OwnerId == parameters.OwnerId &&
                p.DeletedAt == null);

        if (page == null)
        {
            return new PageAdminResult
            {
                Succeeded = false,
                Errors = new[] { "Page not found." }
            };
        }

        var admin = await _dbContext.PageAdmins
            .FirstOrDefaultAsync(a =>
                a.PageId == parameters.PageId &&
                a.UserId == parameters.UserId &&
                a.RevokedAt == null);

        if (admin == null)
        {
            return new PageAdminResult
            {
                Succeeded = false,
                Errors = new[] { "Page admin not found." }
            };
        }

        if (admin.Role == RoleOwner || admin.UserId == page.OwnerId)
        {
            return Error("Page owner admin cannot be removed.");
        }

        admin.RevokedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Success(admin);
    }

    public async Task<IReadOnlyCollection<PageAdminDto>> GetPageAdminsAsync(
        GetPageAdminsParameters parameters)
    {
        if (!await CanManagePageAdminsAsync(parameters.UserId, parameters.PageId))
            return Array.Empty<PageAdminDto>();

        var admins = await _dbContext.PageAdmins
            .AsNoTracking()
            .Where(a => a.PageId == parameters.PageId && a.RevokedAt == null)
            .OrderByDescending(a => a.AssignedAt)
            .ToListAsync();

        return admins.Select(MapToDto).ToList();
    }

    private async Task<bool> CanManagePageAdminsAsync(string userId, Guid pageId)
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

    private static PageAdminResult Success(PageAdmin admin)
    {
        return new PageAdminResult
        {
            Succeeded = true,
            PageAdmin = MapToDto(admin)
        };
    }

    private static PageAdminResult Error(string message)
    {
        return new PageAdminResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static PageAdminDto MapToDto(PageAdmin admin)
    {
        return new PageAdminDto
        {
            Id = admin.Id,
            PageId = admin.PageId,
            UserId = admin.UserId,
            Role = admin.Role,
            AssignedAt = admin.AssignedAt,
            RevokedAt = admin.RevokedAt
        };
    }
}
