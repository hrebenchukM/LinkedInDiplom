using Facade.AdminManagement.Contracts.Requests;
using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.RecommendedJobQuery;

namespace Facade.AdminManagement.Services.Services;

public partial class AdminManagementService
{
    public Task<IReadOnlyCollection<RecommendedJobQueryDto>> GetRecommendedJobQueriesAsync(
        CancellationToken cancellationToken = default)
        => _recommendedJobQueryResource.GetRecommendedQueriesAsync(
            new GetRecommendedJobQueriesParameters { UserId = string.Empty });

    public async Task<RecommendedJobQueryDto> CreateRecommendedJobQueryAsync(
        CreateRecommendedJobQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _recommendedJobQueryResource.CreateAsync(
            new CreateRecommendedJobQueryParameters
            {
                UserId = string.Empty,
                Query = request.Query
            });

        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                result.Errors.FirstOrDefault() ?? "Failed to create recommended job query.");
        }

        return result.RecommendedJobQuery!;
    }

    public async Task DeleteRecommendedJobQueryAsync(
        Guid recommendedJobQueryId,
        CancellationToken cancellationToken = default)
    {
        var result = await _recommendedJobQueryResource.DeleteAsync(
            new DeleteRecommendedJobQueryParameters
            {
                UserId = string.Empty,
                RecommendedQueryId = recommendedJobQueryId
            });

        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                result.Errors.FirstOrDefault() ?? "Failed to delete recommended job query.");
        }
    }
}
