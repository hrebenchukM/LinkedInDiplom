using Microsoft.EntityFrameworkCore;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters.ProfileView;
using Profile.Contracts.Results;
using Profile.Contracts.Services;
using Profile.DataAccess;
using Profile.DataAccess.Entities;

namespace Profile.Services.Services;

// Сервис журнала просмотров профиля (append-only)
public class ProfileViewService : IProfileViewService
{
    private const int MaxProfileViews = 100;

    private readonly ProfileDbContext _dbContext;

    public ProfileViewService(ProfileDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ProfileViewResult> RecordProfileViewAsync(RecordProfileViewParameters parameters)
    {
        var profileExists = await _dbContext.UserProfiles
            .AsNoTracking()
            .AnyAsync(p =>
                p.UserId == parameters.ProfileOwnerId &&
                p.DeletedAt == null);

        if (!profileExists)
        {
            return new ProfileViewResult
            {
                Succeeded = false,
                Errors = new[] { "Profile not found." }
            };
        }

        var source = string.IsNullOrWhiteSpace(parameters.Source)
            ? null
            : parameters.Source.Trim();

        var viewerIp = string.IsNullOrWhiteSpace(parameters.ViewerIp)
            ? "unknown"
            : parameters.ViewerIp;

        var profileView = new ProfileView
        {
            Id = Guid.NewGuid(),
            ProfileOwnerId = parameters.ProfileOwnerId,
            ViewerUserId = parameters.ViewerUserId,
            ViewerIp = viewerIp,
            ViewerUserAgent = parameters.ViewerUserAgent,
            Source = source,
            ViewedAt = DateTime.UtcNow
        };

        _dbContext.ProfileViews.Add(profileView);
        await _dbContext.SaveChangesAsync();

        return new ProfileViewResult
        {
            Succeeded = true,
            ProfileView = MapToDto(profileView)
        };
    }

    public async Task<IReadOnlyCollection<ProfileViewDto>> GetMyProfileViewsAsync(
        GetMyProfileViewsParameters parameters)
    {
        var views = await _dbContext.ProfileViews
            .AsNoTracking()
            .Where(v => v.ProfileOwnerId == parameters.ProfileOwnerId)
            .OrderByDescending(v => v.ViewedAt)
            .Take(MaxProfileViews)
            .ToListAsync();

        return views.Select(MapToDto).ToList();
    }

    private static ProfileViewDto MapToDto(ProfileView view)
    {
        return new ProfileViewDto
        {
            Id = view.Id,
            ProfileOwnerId = view.ProfileOwnerId,
            ViewerUserId = view.ViewerUserId,
            ViewerIp = view.ViewerIp,
            ViewerUserAgent = view.ViewerUserAgent,
            Source = view.Source,
            ViewedAt = view.ViewedAt
        };
    }
}
