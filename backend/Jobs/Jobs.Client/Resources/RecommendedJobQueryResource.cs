using Jobs.Client.Contracts.Resources;
using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.RecommendedJobQuery;
using Jobs.Contracts.Results;
using Jobs.Contracts.Services;

namespace Jobs.Client.Resources;

public class RecommendedJobQueryResource : IRecommendedJobQueryResource
{
    private readonly IRecommendedJobQueryService _recommendedJobQueryService;

    public RecommendedJobQueryResource(IRecommendedJobQueryService recommendedJobQueryService)
    {
        _recommendedJobQueryService = recommendedJobQueryService;
    }

    public Task<RecommendedJobQueryResult> CreateAsync(CreateRecommendedJobQueryParameters parameters)
    {
        return _recommendedJobQueryService.CreateAsync(parameters);
    }

    public Task<IReadOnlyCollection<RecommendedJobQueryDto>> GetRecommendedQueriesAsync(GetRecommendedJobQueriesParameters parameters)
    {
        return _recommendedJobQueryService.GetRecommendedQueriesAsync(parameters);
    }

    public Task<RecommendedJobQueryResult> DeleteAsync(DeleteRecommendedJobQueryParameters parameters)
    {
        return _recommendedJobQueryService.DeleteAsync(parameters);
    }
}
