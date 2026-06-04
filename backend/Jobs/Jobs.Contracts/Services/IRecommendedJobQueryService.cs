using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.RecommendedJobQuery;
using Jobs.Contracts.Results;

namespace Jobs.Contracts.Services;

public interface IRecommendedJobQueryService
{
    Task<RecommendedJobQueryResult> CreateAsync(CreateRecommendedJobQueryParameters parameters);
    Task<IReadOnlyCollection<RecommendedJobQueryDto>> GetRecommendedQueriesAsync(GetRecommendedJobQueriesParameters parameters);
    Task<RecommendedJobQueryResult> DeleteAsync(DeleteRecommendedJobQueryParameters parameters);
}
