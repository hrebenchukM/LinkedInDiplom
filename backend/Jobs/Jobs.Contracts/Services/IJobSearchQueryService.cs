using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.JobSearchQuery;
using Jobs.Contracts.Results;

namespace Jobs.Contracts.Services;

public interface IJobSearchQueryService
{
    Task<JobSearchQueryResult> CreateAsync(CreateJobSearchQueryParameters parameters);
    Task<IReadOnlyCollection<JobSearchQueryDto>> GetMySearchQueriesAsync(GetMyJobSearchQueriesParameters parameters);
    Task<JobSearchQueryDto?> GetByIdAsync(GetJobSearchQueryByIdParameters parameters);
    Task<JobSearchQueryResult> DeleteAsync(DeleteJobSearchQueryParameters parameters);
}
