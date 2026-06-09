using AI.Contracts.DTOs;

namespace AI.Contracts.Services;

public interface IAIService
{
    Task<IReadOnlyCollection<JobRecommendationDto>> GetRecommendedJobsAsync(string userId);
    Task<CareerAdviceDto> GetCareerAdviceAsync(string userId);
}
