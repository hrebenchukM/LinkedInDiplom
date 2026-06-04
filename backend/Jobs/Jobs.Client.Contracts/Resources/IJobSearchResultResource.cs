using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.JobSearchResult;
using Jobs.Contracts.Results;

namespace Jobs.Client.Contracts.Resources;

public interface IJobSearchResultResource
{
    Task<JobSearchResultResult> UpsertResultsAsync(UpsertJobSearchResultsParameters parameters);
    Task<IReadOnlyCollection<JobSearchResultDto>> GetBySearchIdAsync(GetJobSearchResultsParameters parameters);
}
