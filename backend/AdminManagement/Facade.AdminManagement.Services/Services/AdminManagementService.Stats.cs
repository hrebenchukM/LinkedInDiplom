using Facade.AdminManagement.Contracts.DTOs;

namespace Facade.AdminManagement.Services.Services;

public partial class AdminManagementService
{
    public async Task<AdminStatsOverviewDto> GetStatsOverviewAsync(
        CancellationToken cancellationToken = default)
    {
        var identityStats = await _userResource.GetIdentityStatsAsync(cancellationToken);
        var contentStats = await _postResource.GetContentStatsAsync(cancellationToken);
        var jobsStats = await _vacancyResource.GetJobsStatsAsync(cancellationToken);

        return new AdminStatsOverviewDto
        {
            TotalUsers = identityStats.TotalUsers,
            DeletedUsers = identityStats.DeletedUsers,
            ActiveUsers = identityStats.ActiveUsers,
            TotalPosts = contentStats.TotalPosts,
            DeletedPosts = contentStats.DeletedPosts,
            ActivePosts = contentStats.ActivePosts,
            TotalVacancies = jobsStats.TotalVacancies,
            DeletedVacancies = jobsStats.DeletedVacancies,
            ActiveVacancies = jobsStats.ActiveVacancies,
            TotalRecommendedJobQueries = jobsStats.TotalRecommendedJobQueries
        };
    }
}
