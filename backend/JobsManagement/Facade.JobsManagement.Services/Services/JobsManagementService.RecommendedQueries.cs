using Facade.JobsManagement.Contracts.DTOs;
using Facade.JobsManagement.Contracts.Requests.RecommendedQuery;
using Facade.JobsManagement.Contracts.Responses;
using Jobs.Contracts.Parameters.RecommendedJobQuery;

namespace Facade.JobsManagement.Services.Services;

public partial class JobsManagementService
{
    public async Task<RecommendedJobQueryResponse> CreateRecommendedQueryAsync(string userId, CreateRecommendedJobQueryRequest request)
    {
        var result = await _jobsClient.RecommendedQueries.CreateAsync(new CreateRecommendedJobQueryParameters
        {
            UserId = userId,
            Query = request.Query
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<RecommendedJobQueryDto>> GetRecommendedQueriesAsync(string userId)
    {
        var queries = await _jobsClient.RecommendedQueries.GetRecommendedQueriesAsync(new GetRecommendedJobQueriesParameters
        {
            UserId = userId
        });

        return queries.Select(Map).ToList();
    }

    public async Task<RecommendedJobQueryResponse> DeleteRecommendedQueryAsync(string userId, Guid recommendedQueryId)
    {
        var result = await _jobsClient.RecommendedQueries.DeleteAsync(new DeleteRecommendedJobQueryParameters
        {
            UserId = userId,
            RecommendedQueryId = recommendedQueryId
        });

        return Map(result);
    }
}
