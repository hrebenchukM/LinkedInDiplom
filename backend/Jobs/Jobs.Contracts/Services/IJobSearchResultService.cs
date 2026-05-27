using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.JobSearchResult;
using Jobs.Contracts.Results;

namespace Jobs.Contracts.Services;

public interface IJobSearchResultService
{
    Task<JobSearchResultResult> UpsertResultsAsync(UpsertJobSearchResultsParameters parameters);
    Task<IReadOnlyCollection<JobSearchResultDto>> GetBySearchIdAsync(GetJobSearchResultsParameters parameters);
}
