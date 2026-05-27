using Facade.JobsManagement.Contracts.DTOs;
using Facade.JobsManagement.Contracts.Requests.RecommendedQuery;
using Facade.JobsManagement.Contracts.Requests.SearchQuery;
using Facade.JobsManagement.Contracts.Requests.SearchResult;
using Facade.JobsManagement.Contracts.Requests.Vacancy;
using Facade.JobsManagement.Contracts.Responses;
using Facade.JobsManagement.Contracts.Services;
using Jobs.Client.Contracts;
using Jobs.Contracts.Parameters.JobApplication;
using Jobs.Contracts.Parameters.JobSearchQuery;
using Jobs.Contracts.Parameters.JobSearchResult;
using Jobs.Contracts.Parameters.RecommendedJobQuery;
using Jobs.Contracts.Parameters.UserVacancyFavorite;
using Jobs.Contracts.Parameters.Vacancy;
using JobsApplicationResult = Jobs.Contracts.Results.JobApplicationResult;
using JobsFavoriteResult = Jobs.Contracts.Results.UserVacancyFavoriteResult;
using JobsRecommendedResult = Jobs.Contracts.Results.RecommendedJobQueryResult;
using JobsSearchQueryResult = Jobs.Contracts.Results.JobSearchQueryResult;
using JobsSearchResultResult = Jobs.Contracts.Results.JobSearchResultResult;
using JobsVacancyResult = Jobs.Contracts.Results.VacancyResult;
using JobsApplicationDto = Jobs.Contracts.DTOs.JobApplicationDto;
using JobsFavoriteDto = Jobs.Contracts.DTOs.UserVacancyFavoriteDto;
using JobsRecommendedDto = Jobs.Contracts.DTOs.RecommendedJobQueryDto;
using JobsSearchQueryDto = Jobs.Contracts.DTOs.JobSearchQueryDto;
using JobsSearchResultDto = Jobs.Contracts.DTOs.JobSearchResultDto;
using JobsVacancyDto = Jobs.Contracts.DTOs.VacancyDto;

namespace Facade.JobsManagement.Services.Services;

public class JobsManagementService : IJobsManagementService
{
    private readonly IJobsClient _jobsClient;

    public JobsManagementService(IJobsClient jobsClient)
    {
        _jobsClient = jobsClient;
    }

    public async Task<VacancyResponse> CreateVacancyAsync(string userId, CreateVacancyRequest request)
    {
        var result = await _jobsClient.Vacancies.CreateAsync(new CreateVacancyParameters
        {
            UserId = userId,
            CompanyId = request.CompanyId,
            Title = request.Title,
            JobType = request.JobType,
            Schedule = request.Schedule,
            Location = request.Location,
            SalaryFrom = request.SalaryFrom,
            SalaryTo = request.SalaryTo,
            SalaryCurrency = request.SalaryCurrency,
            Description = request.Description
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<VacancyDto>> GetVacanciesAsync(string userId, string? query, string? location, Guid? companyId)
    {
        var vacancies = await _jobsClient.Vacancies.GetVacanciesAsync(new GetVacanciesParameters
        {
            UserId = userId,
            Query = query,
            Location = location,
            CompanyId = companyId
        });

        return vacancies.Select(Map).ToList();
    }

    public async Task<VacancyDto?> GetVacancyByIdAsync(string userId, Guid vacancyId)
    {
        var vacancy = await _jobsClient.Vacancies.GetByIdAsync(new GetVacancyByIdParameters
        {
            UserId = userId,
            VacancyId = vacancyId
        });

        return vacancy is null ? null : Map(vacancy);
    }

    public async Task<VacancyResponse> UpdateVacancyAsync(string userId, Guid vacancyId, UpdateVacancyRequest request)
    {
        var result = await _jobsClient.Vacancies.UpdateAsync(new UpdateVacancyParameters
        {
            UserId = userId,
            VacancyId = vacancyId,
            CompanyId = request.CompanyId,
            Title = request.Title,
            JobType = request.JobType,
            Schedule = request.Schedule,
            Location = request.Location,
            SalaryFrom = request.SalaryFrom,
            SalaryTo = request.SalaryTo,
            SalaryCurrency = request.SalaryCurrency,
            Description = request.Description
        });

        return Map(result);
    }

    public async Task<VacancyResponse> DeleteVacancyAsync(string userId, Guid vacancyId)
    {
        var result = await _jobsClient.Vacancies.DeleteAsync(new DeleteVacancyParameters
        {
            UserId = userId,
            VacancyId = vacancyId
        });

        return Map(result);
    }

    public async Task<UserVacancyFavoriteResponse> AddFavoriteAsync(string userId, Guid vacancyId)
    {
        var result = await _jobsClient.Favorites.AddAsync(new AddVacancyFavoriteParameters
        {
            UserId = userId,
            VacancyId = vacancyId
        });

        return Map(result);
    }

    public async Task<UserVacancyFavoriteResponse> RemoveFavoriteAsync(string userId, Guid vacancyId)
    {
        var result = await _jobsClient.Favorites.RemoveAsync(new RemoveVacancyFavoriteParameters
        {
            UserId = userId,
            VacancyId = vacancyId
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<UserVacancyFavoriteDto>> GetMyFavoritesAsync(string userId)
    {
        var favorites = await _jobsClient.Favorites.GetMyFavoritesAsync(new GetMyVacancyFavoritesParameters
        {
            UserId = userId
        });

        return favorites.Select(Map).ToList();
    }

    public async Task<JobApplicationResponse> ApplyToVacancyAsync(string userId, Guid vacancyId)
    {
        var result = await _jobsClient.Applications.ApplyAsync(new ApplyToVacancyParameters
        {
            UserId = userId,
            VacancyId = vacancyId
        });

        return Map(result);
    }

    public async Task<JobApplicationResponse> WithdrawApplicationAsync(string userId, Guid applicationId)
    {
        var result = await _jobsClient.Applications.WithdrawAsync(new WithdrawJobApplicationParameters
        {
            UserId = userId,
            ApplicationId = applicationId
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<JobApplicationDto>> GetMyApplicationsAsync(string userId)
    {
        var applications = await _jobsClient.Applications.GetMyApplicationsAsync(new GetMyJobApplicationsParameters
        {
            UserId = userId
        });

        return applications.Select(Map).ToList();
    }

    public async Task<IReadOnlyCollection<JobApplicationDto>?> GetVacancyApplicationsAsync(string userId, Guid vacancyId)
    {
        var vacancy = await _jobsClient.Vacancies.GetByIdAsync(new GetVacancyByIdParameters
        {
            UserId = userId,
            VacancyId = vacancyId
        });

        if (vacancy is null || vacancy.PostedBy != userId)
            return null;

        var applications = await _jobsClient.Applications.GetVacancyApplicationsAsync(new GetVacancyApplicationsParameters
        {
            UserId = userId,
            VacancyId = vacancyId
        });

        return applications.Select(Map).ToList();
    }

    public async Task<JobSearchQueryResponse> CreateSearchQueryAsync(string userId, CreateJobSearchQueryRequest request)
    {
        var result = await _jobsClient.SearchQueries.CreateAsync(new CreateJobSearchQueryParameters
        {
            UserId = userId,
            Query = request.Query,
            Location = request.Location,
            Radius = request.Radius
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<JobSearchQueryDto>> GetMySearchQueriesAsync(string userId)
    {
        var queries = await _jobsClient.SearchQueries.GetMySearchQueriesAsync(new GetMyJobSearchQueriesParameters
        {
            UserId = userId
        });

        return queries.Select(Map).ToList();
    }

    public async Task<JobSearchQueryDto?> GetSearchQueryByIdAsync(string userId, Guid searchId)
    {
        var query = await _jobsClient.SearchQueries.GetByIdAsync(new GetJobSearchQueryByIdParameters
        {
            UserId = userId,
            SearchId = searchId
        });

        return query is null ? null : Map(query);
    }

    public async Task<JobSearchQueryResponse> DeleteSearchQueryAsync(string userId, Guid searchId)
    {
        var result = await _jobsClient.SearchQueries.DeleteAsync(new DeleteJobSearchQueryParameters
        {
            UserId = userId,
            SearchId = searchId
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<JobSearchResultDto>?> GetSearchResultsAsync(string userId, Guid searchId)
    {
        var query = await _jobsClient.SearchQueries.GetByIdAsync(new GetJobSearchQueryByIdParameters
        {
            UserId = userId,
            SearchId = searchId
        });

        if (query is null)
            return null;

        var results = await _jobsClient.SearchResults.GetBySearchIdAsync(new GetJobSearchResultsParameters
        {
            UserId = userId,
            SearchId = searchId
        });

        return results.Select(Map).ToList();
    }

    public async Task<JobSearchResultResponse> UpsertSearchResultsAsync(string userId, Guid searchId, UpsertJobSearchResultsRequest request)
    {
        var result = await _jobsClient.SearchResults.UpsertResultsAsync(new UpsertJobSearchResultsParameters
        {
            UserId = userId,
            SearchId = searchId,
            VacancyIds = request.VacancyIds
        });

        return Map(result);
    }

    public async Task<RecommendedJobQueryResponse> CreateRecommendedQueryAsync(string userId, CreateRecommendedJobQueryRequest request)
    {
        var result = await _jobsClient.RecommendedQueries.CreateAsync(new CreateRecommendedJobQueryParameters
        {
            UserId = userId,
            Query = request.Query
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<RecommendedJobQueryDto>> GetRecommendedQueriesAsync(string userId)
    {
        var queries = await _jobsClient.RecommendedQueries.GetRecommendedQueriesAsync(new GetRecommendedJobQueriesParameters
        {
            UserId = userId
        });

        return queries.Select(Map).ToList();
    }

    public async Task<RecommendedJobQueryResponse> DeleteRecommendedQueryAsync(string userId, Guid recommendedQueryId)
    {
        var result = await _jobsClient.RecommendedQueries.DeleteAsync(new DeleteRecommendedJobQueryParameters
        {
            UserId = userId,
            RecommendedQueryId = recommendedQueryId
        });

        return Map(result);
    }

    private static VacancyResponse Map(JobsVacancyResult result) =>
        new()
        {
            Success = result.Succeeded,
            Vacancy = result.Vacancy is null ? null : Map(result.Vacancy),
            Errors = result.Errors
        };

    private static UserVacancyFavoriteResponse Map(JobsFavoriteResult result) =>
        new()
        {
            Success = result.Succeeded,
            Favorite = result.UserVacancyFavorite is null ? null : Map(result.UserVacancyFavorite),
            Errors = result.Errors
        };

    private static JobApplicationResponse Map(JobsApplicationResult result) =>
        new()
        {
            Success = result.Succeeded,
            Application = result.JobApplication is null ? null : Map(result.JobApplication),
            Errors = result.Errors
        };

    private static JobSearchQueryResponse Map(JobsSearchQueryResult result) =>
        new()
        {
            Success = result.Succeeded,
            SearchQuery = result.JobSearchQuery is null ? null : Map(result.JobSearchQuery),
            Errors = result.Errors
        };

    private static JobSearchResultResponse Map(JobsSearchResultResult result) =>
        new()
        {
            Success = result.Succeeded,
            SearchResult = result.JobSearchResult is null ? null : Map(result.JobSearchResult),
            Errors = result.Errors
        };

    private static RecommendedJobQueryResponse Map(JobsRecommendedResult result) =>
        new()
        {
            Success = result.Succeeded,
            RecommendedQuery = result.RecommendedJobQuery is null ? null : Map(result.RecommendedJobQuery),
            Errors = result.Errors
        };

    private static VacancyDto Map(JobsVacancyDto dto) =>
        new()
        {
            Id = dto.Id,
            CompanyId = dto.CompanyId,
            PostedBy = dto.PostedBy,
            Title = dto.Title,
            JobType = dto.JobType,
            Schedule = dto.Schedule,
            Location = dto.Location,
            SalaryFrom = dto.SalaryFrom,
            SalaryTo = dto.SalaryTo,
            SalaryCurrency = dto.SalaryCurrency,
            Description = dto.Description,
            PostedAt = dto.PostedAt,
            UpdatedAt = dto.UpdatedAt
        };

    private static UserVacancyFavoriteDto Map(JobsFavoriteDto dto) =>
        new()
        {
            Id = dto.Id,
            UserId = dto.UserId,
            VacancyId = dto.VacancyId,
            CreatedAt = dto.CreatedAt,
            Vacancy = dto.Vacancy is null ? null : Map(dto.Vacancy)
        };

    private static JobApplicationDto Map(JobsApplicationDto dto) =>
        new()
        {
            Id = dto.Id,
            VacancyId = dto.VacancyId,
            UserId = dto.UserId,
            Status = dto.Status,
            AppliedAt = dto.AppliedAt,
            StatusChangedAt = dto.StatusChangedAt,
            WithdrawnAt = dto.WithdrawnAt,
            Vacancy = dto.Vacancy is null ? null : Map(dto.Vacancy)
        };

    private static JobSearchQueryDto Map(JobsSearchQueryDto dto) =>
        new()
        {
            Id = dto.Id,
            UserId = dto.UserId,
            Query = dto.Query,
            Location = dto.Location,
            Radius = dto.Radius,
            CreatedAt = dto.CreatedAt,
            UpdatedAt = dto.UpdatedAt
        };

    private static JobSearchResultDto Map(JobsSearchResultDto dto) =>
        new()
        {
            Id = dto.Id,
            SearchId = dto.SearchId,
            VacancyId = dto.VacancyId,
            OrderIndex = dto.OrderIndex,
            CreatedAt = dto.CreatedAt,
            Vacancy = dto.Vacancy is null ? null : Map(dto.Vacancy)
        };

    private static RecommendedJobQueryDto Map(JobsRecommendedDto dto) =>
        new()
        {
            Id = dto.Id,
            Query = dto.Query,
            CreatedAt = dto.CreatedAt
        };
}
