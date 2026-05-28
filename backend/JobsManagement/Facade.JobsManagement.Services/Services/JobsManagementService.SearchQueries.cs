using Facade.JobsManagement.Contracts.DTOs;
using Facade.JobsManagement.Contracts.Requests.SearchQuery;
using Facade.JobsManagement.Contracts.Responses;
using Jobs.Contracts.Parameters.JobSearchQuery;

namespace Facade.JobsManagement.Services.Services;

public partial class JobsManagementService
{
    public async Task<JobSearchQueryResponse> CreateSearchQueryAsync(string userId, CreateJobSearchQueryRequest request)
    {
        var result = await _jobsClient.SearchQueries.CreateAsync(new CreateJobSearchQueryParameters
        {
            UserId = userId,
            Query = request.Query,
            Location = request.Location,
            Radius = request.Radius
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<JobSearchQueryDto>> GetMySearchQueriesAsync(string userId)
    {
        var queries = await _jobsClient.SearchQueries.GetMySearchQueriesAsync(new GetMyJobSearchQueriesParameters
        {
            UserId = userId
        });

        return queries.Select(Map).ToList();
    }

    public async Task<JobSearchQueryDto?> GetSearchQueryByIdAsync(string userId, Guid searchId)
    {
        var query = await _jobsClient.SearchQueries.GetByIdAsync(new GetJobSearchQueryByIdParameters
        {
            UserId = userId,
            SearchId = searchId
        });

        return query is null ? null : Map(query);
    }

    public async Task<JobSearchQueryResponse> DeleteSearchQueryAsync(string userId, Guid searchId)
    {
        var result = await _jobsClient.SearchQueries.DeleteAsync(new DeleteJobSearchQueryParameters
        {
            UserId = userId,
            SearchId = searchId
        });

        return Map(result);
    }
}
