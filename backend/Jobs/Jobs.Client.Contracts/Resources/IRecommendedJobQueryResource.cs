using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.RecommendedJobQuery;
using Jobs.Contracts.Results;

namespace Jobs.Client.Contracts.Resources;

public interface IRecommendedJobQueryResource
{
    Task<RecommendedJobQueryResult> CreateAsync(CreateRecommendedJobQueryParameters parameters);
    Task<IReadOnlyCollection<RecommendedJobQueryDto>> GetRecommendedQueriesAsync(GetRecommendedJobQueriesParameters parameters);
    Task<RecommendedJobQueryResult> DeleteAsync(DeleteRecommendedJobQueryParameters parameters);
}
