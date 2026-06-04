using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.JobApplication;
using Jobs.Contracts.Results;

namespace Jobs.Client.Contracts.Resources;

public interface IJobApplicationResource
{
    Task<JobApplicationResult> ApplyAsync(ApplyToVacancyParameters parameters);
    Task<JobApplicationResult> WithdrawAsync(WithdrawJobApplicationParameters parameters);
    Task<IReadOnlyCollection<JobApplicationDto>> GetMyApplicationsAsync(GetMyJobApplicationsParameters parameters);
    Task<IReadOnlyCollection<JobApplicationDto>> GetVacancyApplicationsAsync(GetVacancyApplicationsParameters parameters);
}
