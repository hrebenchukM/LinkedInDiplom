using Facade.JobsManagement.Contracts.DTOs;
using Jobs.Contracts.Parameters.RecommendedJobQuery;

namespace Facade.JobsManagement.Services.Services;

public partial class JobsManagementService
{
    public async Task<IReadOnlyCollection<RecommendedJobQueryDto>> GetRecommendedQueriesAsync(string userId)
    {
        var queries = await _jobsClient.RecommendedQueries.GetRecommendedQueriesAsync(new GetRecommendedJobQueriesParameters
        {
            UserId = userId
        });

        return queries.Select(MapRecommendedQueryToFacadeDto).ToList();
    }
}
