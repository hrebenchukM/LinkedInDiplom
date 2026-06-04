using Jobs.Client.Contracts.Resources;
using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.JobApplication;
using Jobs.Contracts.Results;
using Jobs.Contracts.Services;

namespace Jobs.Client.Resources;

public class JobApplicationResource : IJobApplicationResource
{
    private readonly IJobApplicationService _applicationService;

    public JobApplicationResource(IJobApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    public Task<JobApplicationResult> ApplyAsync(ApplyToVacancyParameters parameters)
    {
        return _applicationService.ApplyAsync(parameters);
    }

    public Task<JobApplicationResult> WithdrawAsync(WithdrawJobApplicationParameters parameters)
    {
        return _applicationService.WithdrawAsync(parameters);
    }

    public Task<IReadOnlyCollection<JobApplicationDto>> GetMyApplicationsAsync(GetMyJobApplicationsParameters parameters)
    {
        return _applicationService.GetMyApplicationsAsync(parameters);
    }

    public Task<IReadOnlyCollection<JobApplicationDto>> GetVacancyApplicationsAsync(GetVacancyApplicationsParameters parameters)
    {
        return _applicationService.GetVacancyApplicationsAsync(parameters);
    }
}
