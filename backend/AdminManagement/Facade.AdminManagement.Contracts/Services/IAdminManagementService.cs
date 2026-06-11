using Content.Contracts.DTOs;
using Events.Contracts.DTOs;
using Facade.AdminManagement.Contracts.DTOs;
using Facade.AdminManagement.Contracts.Requests;
using Facade.Shared.Contracts.Pagination;
using Identity.Contracts.DTOs;
using Jobs.Contracts.DTOs;

namespace Facade.AdminManagement.Contracts.Services;

public interface IAdminManagementService
{
    Task<PagedResponse<AdminUserDto>> GetUsersAsync(
        AdminUsersQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<AdminUserDto> GetUserByIdAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task LockUserAsync(
        string userId,
        DateTimeOffset? lockoutEnd = null,
        CancellationToken cancellationToken = default);

    Task UnlockUserAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task SoftDeleteUserAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task RestoreUserAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<RoleDto>> GetRolesAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<string>> GetUserRolesAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task AddUserToRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default);

    Task RemoveUserFromRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default);

    Task<PagedResponse<AdminPostDto>> GetAdminPostsAsync(
        AdminPostsQueryRequest request,
        CancellationToken cancellationToken = default);

    Task AdminSoftDeletePostAsync(
        Guid postId,
        CancellationToken cancellationToken = default);

    Task AdminRestorePostAsync(
        Guid postId,
        CancellationToken cancellationToken = default);

    Task<PagedResponse<AdminVacancyDto>> GetAdminVacanciesAsync(
        AdminVacanciesQueryRequest request,
        CancellationToken cancellationToken = default);

    Task AdminSoftDeleteVacancyAsync(
        Guid vacancyId,
        CancellationToken cancellationToken = default);

    Task AdminRestoreVacancyAsync(
        Guid vacancyId,
        CancellationToken cancellationToken = default);

    Task<PagedResponse<AdminEventDto>> GetAdminEventsAsync(
        AdminEventsQueryRequest request,
        CancellationToken cancellationToken = default);

    Task AdminSoftDeleteEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default);

    Task AdminRestoreEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<RecommendedJobQueryDto>> GetRecommendedJobQueriesAsync(
        CancellationToken cancellationToken = default);

    Task<RecommendedJobQueryDto> CreateRecommendedJobQueryAsync(
        CreateRecommendedJobQueryRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteRecommendedJobQueryAsync(
        Guid recommendedJobQueryId,
        CancellationToken cancellationToken = default);

    Task<AdminStatsOverviewDto> GetStatsOverviewAsync(
        CancellationToken cancellationToken = default);
}
