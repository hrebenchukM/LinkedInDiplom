using Facade.JobsManagement.Contracts.DTOs;
using Facade.JobsManagement.Contracts.Requests.Vacancy;
using Facade.JobsManagement.Contracts.Responses;
using Facade.Shared.Contracts.Pagination;
using Jobs.Contracts.Parameters.Vacancy;

namespace Facade.JobsManagement.Services.Services;

public partial class JobsManagementService
{
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

        return MapVacancyResultToFacadeResponse(result);
    }

    public async Task<PagedResponse<VacancyDto>> GetVacanciesAsync(
        string userId,
        GetVacanciesQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.FromCreatedAt.HasValue
            && request.ToCreatedAt.HasValue
            && request.FromCreatedAt > request.ToCreatedAt)
        {
            throw new InvalidOperationException("FromCreatedAt must be less than or equal to ToCreatedAt.");
        }

        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _jobsClient.Vacancies.GetVacanciesAsync(
            new GetVacanciesParameters
            {
                UserId = userId,
                Skip = skip,
                Take = pageSize,
                CompanyId = request.CompanyId,
                PostedByUserId = request.PostedByUserId,
                Query = request.Query ?? request.Search,
                Location = request.Location,
                JobType = request.EmploymentType,
                Schedule = request.Schedule,
                MinSalaryFrom = request.MinSalaryFrom,
                FromCreatedAt = request.FromCreatedAt,
                ToCreatedAt = request.ToCreatedAt,
                SortBy = request.SortBy,
                SortDirection = request.SortDirection
            },
            cancellationToken);

        var items = result.Items
            .Select(MapVacancyToFacadeDto)
            .ToList();

        return Pagination.Create(items, page, pageSize, result.TotalCount);
    }

    public async Task<VacancyDto?> GetVacancyByIdAsync(string userId, Guid vacancyId)
    {
        var vacancy = await _jobsClient.Vacancies.GetByIdAsync(new GetVacancyByIdParameters
        {
            UserId = userId,
            VacancyId = vacancyId
        });

        return vacancy is null ? null : MapVacancyToFacadeDto(vacancy);
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

        return MapVacancyResultToFacadeResponse(result);
    }

    public async Task<VacancyResponse> DeleteVacancyAsync(string userId, Guid vacancyId)
    {
        var result = await _jobsClient.Vacancies.DeleteAsync(new DeleteVacancyParameters
        {
            UserId = userId,
            VacancyId = vacancyId
        });

        return MapVacancyResultToFacadeResponse(result);
    }
}
