using Content.Client.Contracts.Resources;
using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Post;
using Events.Client.Contracts.Resources;
using Events.Contracts.DTOs;
using Events.Contracts.Parameters.Event;
using Facade.AdminManagement.Contracts.Requests;
using Facade.AdminManagement.Contracts.Services;
using Facade.Shared.Contracts.Pagination;
using Identity.Client.Contracts.Resources;
using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Jobs.Client.Contracts.Resources;
using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.Vacancy;

namespace Facade.AdminManagement.Services.Services;

public partial class AdminManagementService : IAdminManagementService
{
    private readonly IUserResource _userResource;
    private readonly IPostResource _postResource;
    private readonly IVacancyResource _vacancyResource;
    private readonly IEventResource _eventResource;
    private readonly IRecommendedJobQueryResource _recommendedJobQueryResource;

    public AdminManagementService(
        IUserResource userResource,
        IPostResource postResource,
        IVacancyResource vacancyResource,
        IEventResource eventResource,
        IRecommendedJobQueryResource recommendedJobQueryResource)
    {
        _userResource = userResource;
        _postResource = postResource;
        _vacancyResource = vacancyResource;
        _eventResource = eventResource;
        _recommendedJobQueryResource = recommendedJobQueryResource;
    }

    public async Task<PagedResponse<AdminUserDto>> GetUsersAsync(
        AdminUsersQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _userResource.GetUsersAsync(
            new GetUsersParameters
            {
                Skip = skip,
                Take = pageSize,
                Email = request.Email,
                Role = request.Role,
                IsDeleted = request.IsDeleted,
                IsLocked = request.IsLocked,
                SortBy = request.SortBy,
                SortDirection = request.SortDirection
            },
            cancellationToken);

        return Pagination.Create(result.Items.ToList(), page, pageSize, result.TotalCount);
    }

    public Task<AdminUserDto> GetUserByIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userResource.GetUserByIdAsync(userId, cancellationToken);

    public Task LockUserAsync(
        string userId,
        DateTimeOffset? lockoutEnd = null,
        CancellationToken cancellationToken = default)
        => _userResource.LockUserAsync(userId, lockoutEnd, cancellationToken);

    public Task UnlockUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userResource.UnlockUserAsync(userId, cancellationToken);

    public Task SoftDeleteUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userResource.SoftDeleteUserAsync(userId, cancellationToken);

    public Task RestoreUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userResource.RestoreUserAsync(userId, cancellationToken);

    public Task<IReadOnlyCollection<RoleDto>> GetRolesAsync(
        CancellationToken cancellationToken = default)
        => _userResource.GetRolesAsync(cancellationToken);

    public Task<IReadOnlyCollection<string>> GetUserRolesAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userResource.GetUserRolesAsync(userId, cancellationToken);

    public Task AddUserToRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default)
        => _userResource.AddUserToRoleAsync(userId, roleName, cancellationToken);

    public Task RemoveUserFromRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default)
        => _userResource.RemoveUserFromRoleAsync(userId, roleName, cancellationToken);

    public async Task<PagedResponse<AdminPostDto>> GetAdminPostsAsync(
        AdminPostsQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.CreatedFrom.HasValue
            && request.CreatedTo.HasValue
            && request.CreatedFrom > request.CreatedTo)
        {
            throw new InvalidOperationException("CreatedFrom must be less than or equal to CreatedTo.");
        }

        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _postResource.GetAdminPostsAsync(
            new GetAdminPostsParameters
            {
                Skip = skip,
                Take = pageSize,
                AuthorId = request.AuthorId,
                IsDeleted = request.IsDeleted,
                IncludeDeleted = request.IncludeDeleted,
                Search = request.Search,
                CreatedFrom = request.CreatedFrom,
                CreatedTo = request.CreatedTo,
                SortBy = request.SortBy,
                SortDirection = request.SortDirection
            },
            cancellationToken);

        return Pagination.Create(result.Items.ToList(), page, pageSize, result.TotalCount);
    }

    public Task AdminSoftDeletePostAsync(
        Guid postId,
        CancellationToken cancellationToken = default)
        => _postResource.AdminSoftDeletePostAsync(postId, cancellationToken);

    public Task AdminRestorePostAsync(
        Guid postId,
        CancellationToken cancellationToken = default)
        => _postResource.AdminRestorePostAsync(postId, cancellationToken);

    public async Task<PagedResponse<AdminVacancyDto>> GetAdminVacanciesAsync(
        AdminVacanciesQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.CreatedFrom.HasValue
            && request.CreatedTo.HasValue
            && request.CreatedFrom > request.CreatedTo)
        {
            throw new InvalidOperationException("CreatedFrom must be less than or equal to CreatedTo.");
        }

        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _vacancyResource.GetAdminVacanciesAsync(
            new GetAdminVacanciesParameters
            {
                Skip = skip,
                Take = pageSize,
                CompanyId = request.CompanyId,
                PostedByUserId = request.PostedByUserId,
                IsDeleted = request.IsDeleted,
                IncludeDeleted = request.IncludeDeleted,
                Search = request.Search,
                CreatedFrom = request.CreatedFrom,
                CreatedTo = request.CreatedTo,
                SortBy = request.SortBy,
                SortDirection = request.SortDirection
            },
            cancellationToken);

        return Pagination.Create(result.Items.ToList(), page, pageSize, result.TotalCount);
    }

    public Task AdminSoftDeleteVacancyAsync(
        Guid vacancyId,
        CancellationToken cancellationToken = default)
        => _vacancyResource.AdminSoftDeleteVacancyAsync(vacancyId, cancellationToken);

    public Task AdminRestoreVacancyAsync(
        Guid vacancyId,
        CancellationToken cancellationToken = default)
        => _vacancyResource.AdminRestoreVacancyAsync(vacancyId, cancellationToken);

    public async Task<PagedResponse<AdminEventDto>> GetAdminEventsAsync(
        AdminEventsQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.FromStartAt.HasValue
            && request.ToStartAt.HasValue
            && request.FromStartAt > request.ToStartAt)
        {
            throw new InvalidOperationException("FromStartAt must be less than or equal to ToStartAt.");
        }

        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _eventResource.GetAdminEventsAsync(
            new GetAdminEventsParameters
            {
                Skip = skip,
                Take = pageSize,
                OrganizerUserId = request.OrganizerUserId,
                IsDeleted = request.IsDeleted,
                IncludeDeleted = request.IncludeDeleted,
                Query = request.Query,
                FromStartAt = request.FromStartAt,
                ToStartAt = request.ToStartAt,
                Location = request.Location,
                IsOnline = request.IsOnline,
                SortBy = request.SortBy,
                SortDirection = request.SortDirection
            },
            cancellationToken);

        return Pagination.Create(result.Items.ToList(), page, pageSize, result.TotalCount);
    }

    public Task AdminSoftDeleteEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default)
        => _eventResource.AdminSoftDeleteEventAsync(eventId, cancellationToken);

    public Task AdminRestoreEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default)
        => _eventResource.AdminRestoreEventAsync(eventId, cancellationToken);
}
