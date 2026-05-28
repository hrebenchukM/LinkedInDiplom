using Facade.JobsManagement.Contracts.DTOs;
using Facade.JobsManagement.Contracts.Responses;
using Jobs.Contracts.Parameters.JobApplication;
using Jobs.Contracts.Parameters.Vacancy;

namespace Facade.JobsManagement.Services.Services;

public partial class JobsManagementService
{
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
}
