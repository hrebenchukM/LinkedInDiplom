using Jobs.Client.Contracts.Resources;
using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.JobSearchResult;
using Jobs.Contracts.Results;
using Jobs.Contracts.Services;

namespace Jobs.Client.Resources;

public class JobSearchResultResource : IJobSearchResultResource
{
    private readonly IJobSearchResultService _searchResultService;

    public JobSearchResultResource(IJobSearchResultService searchResultService)
    {
        _searchResultService = searchResultService;
    }

    public Task<JobSearchResultResult> UpsertResultsAsync(UpsertJobSearchResultsParameters parameters)
    {
        return _searchResultService.UpsertResultsAsync(parameters);
    }

    public Task<IReadOnlyCollection<JobSearchResultDto>> GetBySearchIdAsync(GetJobSearchResultsParameters parameters)
    {
        return _searchResultService.GetBySearchIdAsync(parameters);
    }
}
