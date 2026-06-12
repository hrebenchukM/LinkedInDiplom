using Jobs.Client.Contracts.Resources;
using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.JobSearchQuery;
using Jobs.Contracts.Results;
using Jobs.Contracts.Services;

namespace Jobs.Client.Resources;

public class JobSearchQueryResource : IJobSearchQueryResource
{
    private readonly IJobSearchQueryService _searchQueryService;

    public JobSearchQueryResource(IJobSearchQueryService searchQueryService)
    {
        _searchQueryService = searchQueryService;
    }

    public Task<JobSearchQueryResult> CreateAsync(CreateJobSearchQueryParameters parameters)
    {
        return _searchQueryService.CreateAsync(parameters);
    }

    public Task<IReadOnlyCollection<JobSearchQueryDto>> GetMySearchQueriesAsync(GetMyJobSearchQueriesParameters parameters)
    {
        return _searchQueryService.GetMySearchQueriesAsync(parameters);
    }

    public Task<JobSearchQueryDto?> GetByIdAsync(GetJobSearchQueryByIdParameters parameters)
    {
        return _searchQueryService.GetByIdAsync(parameters);
    }

    public Task<JobSearchQueryResult> DeleteAsync(DeleteJobSearchQueryParameters parameters)
    {
        return _searchQueryService.DeleteAsync(parameters);
    }
}
