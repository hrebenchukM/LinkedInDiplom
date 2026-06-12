using Facade.JobsManagement.Contracts.DTOs;
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

/// <summary>
/// Facade service для Jobs.
/// Переводит запросы frontend в параметры core JobsClient и обратно в facade responses.
/// </summary>
public partial class JobsManagementService : IJobsManagementService
{
    private readonly IJobsClient _jobsClient;

    public JobsManagementService(IJobsClient jobsClient)
    {
        _jobsClient = jobsClient;
    }

    private static VacancyResponse MapVacancyResultToFacadeResponse(JobsVacancyResult result) =>
        new()
        {
            Success = result.Succeeded,
            Vacancy = result.Vacancy is null ? null : MapVacancyToFacadeDto(result.Vacancy),
            Errors = result.Errors
        };

    private static UserVacancyFavoriteResponse MapFavoriteResultToFacadeResponse(JobsFavoriteResult result) =>
        new()
        {
            Success = result.Succeeded,
            Favorite = result.UserVacancyFavorite is null ? null : MapFavoriteToFacadeDto(result.UserVacancyFavorite),
            Errors = result.Errors
        };

    private static JobApplicationResponse MapApplicationResultToFacadeResponse(JobsApplicationResult result) =>
        new()
        {
            Success = result.Succeeded,
            Application = result.JobApplication is null ? null : MapApplicationToFacadeDto(result.JobApplication),
            Errors = result.Errors
        };

    private static JobSearchQueryResponse MapSearchQueryResultToFacadeResponse(JobsSearchQueryResult result) =>
        new()
        {
            Success = result.Succeeded,
            SearchQuery = result.JobSearchQuery is null ? null : MapSearchQueryToFacadeDto(result.JobSearchQuery),
            Errors = result.Errors
        };

    private static JobSearchResultResponse MapSearchResultResultToFacadeResponse(JobsSearchResultResult result) =>
        new()
        {
            Success = result.Succeeded,
            SearchResult = result.JobSearchResult is null ? null : MapSearchResultToFacadeDto(result.JobSearchResult),
            Errors = result.Errors
        };

    private static VacancyDto MapVacancyToFacadeDto(JobsVacancyDto dto) =>
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

    private static UserVacancyFavoriteDto MapFavoriteToFacadeDto(JobsFavoriteDto dto) =>
        new()
        {
            Id = dto.Id,
            UserId = dto.UserId,
            VacancyId = dto.VacancyId,
            CreatedAt = dto.CreatedAt,
            Vacancy = dto.Vacancy is null ? null : MapVacancyToFacadeDto(dto.Vacancy)
        };

    private static JobApplicationDto MapApplicationToFacadeDto(JobsApplicationDto dto) =>
        new()
        {
            Id = dto.Id,
            VacancyId = dto.VacancyId,
            UserId = dto.UserId,
            Status = dto.Status,
            AppliedAt = dto.AppliedAt,
            StatusChangedAt = dto.StatusChangedAt,
            WithdrawnAt = dto.WithdrawnAt,
            Vacancy = dto.Vacancy is null ? null : MapVacancyToFacadeDto(dto.Vacancy)
        };

    private static JobSearchQueryDto MapSearchQueryToFacadeDto(JobsSearchQueryDto dto) =>
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

    private static JobSearchResultDto MapSearchResultToFacadeDto(JobsSearchResultDto dto) =>
        new()
        {
            Id = dto.Id,
            SearchId = dto.SearchId,
            VacancyId = dto.VacancyId,
            OrderIndex = dto.OrderIndex,
            CreatedAt = dto.CreatedAt,
            Vacancy = dto.Vacancy is null ? null : MapVacancyToFacadeDto(dto.Vacancy)
        };

    private static RecommendedJobQueryDto MapRecommendedQueryToFacadeDto(JobsRecommendedDto dto) =>
        new()
        {
            Id = dto.Id,
            Query = dto.Query,
            CreatedAt = dto.CreatedAt
        };
}
