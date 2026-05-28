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

public partial class JobsManagementService : IJobsManagementService
{
    private readonly IJobsClient _jobsClient;

    public JobsManagementService(IJobsClient jobsClient)
    {
        _jobsClient = jobsClient;
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
