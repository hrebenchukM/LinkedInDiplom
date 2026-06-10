using Content.Client.Contracts.Resources;
using Facade.AdminManagement.Contracts.Services;
using Facade.Shared.Contracts.Pagination;
using Identity.Client.Contracts.Resources;
using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Jobs.Client.Contracts.Resources;

namespace Facade.AdminManagement.Services.Services;

public partial class AdminManagementService : IAdminManagementService
{
    private readonly IUserResource _userResource;
    private readonly IPostResource _postResource;
    private readonly IVacancyResource _vacancyResource;
    private readonly IRecommendedJobQueryResource _recommendedJobQueryResource;

    public AdminManagementService(
        IUserResource userResource,
        IPostResource postResource,
        IVacancyResource vacancyResource,
        IRecommendedJobQueryResource recommendedJobQueryResource)
    {
        _userResource = userResource;
        _postResource = postResource;
        _vacancyResource = vacancyResource;
        _recommendedJobQueryResource = recommendedJobQueryResource;
    }

    public async Task<PagedResponse<AdminUserDto>> GetUsersAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _userResource.GetUsersAsync(
            new GetUsersParameters
            {
                Skip = skip,
                Take = pageSize
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

    public Task AdminSoftDeletePostAsync(
        Guid postId,
        CancellationToken cancellationToken = default)
        => _postResource.AdminSoftDeletePostAsync(postId, cancellationToken);

    public Task AdminRestorePostAsync(
        Guid postId,
        CancellationToken cancellationToken = default)
        => _postResource.AdminRestorePostAsync(postId, cancellationToken);

    public Task AdminSoftDeleteVacancyAsync(
        Guid vacancyId,
        CancellationToken cancellationToken = default)
        => _vacancyResource.AdminSoftDeleteVacancyAsync(vacancyId, cancellationToken);

    public Task AdminRestoreVacancyAsync(
        Guid vacancyId,
        CancellationToken cancellationToken = default)
        => _vacancyResource.AdminRestoreVacancyAsync(vacancyId, cancellationToken);
}
