using Facade.AI.Contracts.Responses;

namespace Facade.AI.Contracts.Services;

public interface IAIManagementService
{
    Task<RecommendedJobsResponse> GetRecommendedJobsAsync(string userId);
    Task<CareerAdviceResponse> GetCareerAdviceAsync(string userId);
}
