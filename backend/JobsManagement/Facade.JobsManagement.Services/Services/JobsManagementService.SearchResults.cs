using Facade.JobsManagement.Contracts.DTOs;
using Facade.JobsManagement.Contracts.Requests.SearchResult;
using Facade.JobsManagement.Contracts.Responses;
using Jobs.Contracts.Parameters.JobSearchQuery;
using Jobs.Contracts.Parameters.JobSearchResult;

namespace Facade.JobsManagement.Services.Services;

public partial class JobsManagementService
{
    public async Task<IReadOnlyCollection<JobSearchResultDto>?> GetSearchResultsAsync(string userId, Guid searchId)
    {
        var query = await _jobsClient.SearchQueries.GetByIdAsync(new GetJobSearchQueryByIdParameters
        {
            UserId = userId,
            SearchId = searchId
        });

        if (query is null)
            return null;

        var results = await _jobsClient.SearchResults.GetBySearchIdAsync(new GetJobSearchResultsParameters
        {
            UserId = userId,
            SearchId = searchId
        });

        return results.Select(Map).ToList();
    }

    public async Task<JobSearchResultResponse> UpsertSearchResultsAsync(string userId, Guid searchId, UpsertJobSearchResultsRequest request)
    {
        var result = await _jobsClient.SearchResults.UpsertResultsAsync(new UpsertJobSearchResultsParameters
        {
            UserId = userId,
            SearchId = searchId,
            VacancyIds = request.VacancyIds
        });

        return Map(result);
    }
}
