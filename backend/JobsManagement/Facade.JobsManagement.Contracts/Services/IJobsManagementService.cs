using Facade.JobsManagement.Contracts.DTOs;
using Facade.JobsManagement.Contracts.Requests.SearchQuery;
using Facade.JobsManagement.Contracts.Requests.SearchResult;
using Facade.JobsManagement.Contracts.Requests.Vacancy;
using Facade.JobsManagement.Contracts.Responses;

namespace Facade.JobsManagement.Contracts.Services;

public interface IJobsManagementService
{
    Task<VacancyResponse> CreateVacancyAsync(string userId, CreateVacancyRequest request);
    Task<IReadOnlyCollection<VacancyDto>> GetVacanciesAsync(string userId, string? query, string? location, Guid? companyId);
    Task<VacancyDto?> GetVacancyByIdAsync(string userId, Guid vacancyId);
    Task<VacancyResponse> UpdateVacancyAsync(string userId, Guid vacancyId, UpdateVacancyRequest request);
    Task<VacancyResponse> DeleteVacancyAsync(string userId, Guid vacancyId);

    Task<UserVacancyFavoriteResponse> AddFavoriteAsync(string userId, Guid vacancyId);
    Task<UserVacancyFavoriteResponse> RemoveFavoriteAsync(string userId, Guid vacancyId);
    Task<IReadOnlyCollection<UserVacancyFavoriteDto>> GetMyFavoritesAsync(string userId);

    Task<JobApplicationResponse> ApplyToVacancyAsync(string userId, Guid vacancyId);
    Task<JobApplicationResponse> WithdrawApplicationAsync(string userId, Guid applicationId);
    Task<IReadOnlyCollection<JobApplicationDto>> GetMyApplicationsAsync(string userId);
    Task<IReadOnlyCollection<JobApplicationDto>?> GetVacancyApplicationsAsync(string userId, Guid vacancyId);

    Task<JobSearchQueryResponse> CreateSearchQueryAsync(string userId, CreateJobSearchQueryRequest request);
    Task<IReadOnlyCollection<JobSearchQueryDto>> GetMySearchQueriesAsync(string userId);
    Task<JobSearchQueryDto?> GetSearchQueryByIdAsync(string userId, Guid searchId);
    Task<JobSearchQueryResponse> DeleteSearchQueryAsync(string userId, Guid searchId);
    Task<IReadOnlyCollection<JobSearchResultDto>?> GetSearchResultsAsync(string userId, Guid searchId);
    Task<JobSearchResultResponse> UpsertSearchResultsAsync(string userId, Guid searchId, UpsertJobSearchResultsRequest request);

    Task<IReadOnlyCollection<RecommendedJobQueryDto>> GetRecommendedQueriesAsync(string userId);
}
