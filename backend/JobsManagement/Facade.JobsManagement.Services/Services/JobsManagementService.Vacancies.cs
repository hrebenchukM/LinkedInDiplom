using Facade.JobsManagement.Contracts.DTOs;
using Facade.JobsManagement.Contracts.Requests.Vacancy;
using Facade.JobsManagement.Contracts.Responses;
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
}
