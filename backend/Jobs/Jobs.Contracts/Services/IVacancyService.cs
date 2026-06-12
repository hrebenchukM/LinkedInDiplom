using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.Vacancy;
using Jobs.Contracts.Results;

namespace Jobs.Contracts.Services;

public interface IVacancyService
{
    Task<VacancyResult> CreateAsync(CreateVacancyParameters parameters);
    Task<VacanciesPageResult> GetVacanciesAsync(
        GetVacanciesParameters parameters,
        CancellationToken cancellationToken = default);
    Task<VacancyDto?> GetByIdAsync(GetVacancyByIdParameters parameters);
    Task<VacancyResult> UpdateAsync(UpdateVacancyParameters parameters);
    Task<VacancyResult> DeleteAsync(DeleteVacancyParameters parameters);

    Task AdminSoftDeleteVacancyAsync(
        Guid vacancyId,
        CancellationToken cancellationToken = default);

    Task AdminRestoreVacancyAsync(
        Guid vacancyId,
        CancellationToken cancellationToken = default);

    Task<AdminVacanciesResult> GetAdminVacanciesAsync(
        GetAdminVacanciesParameters parameters,
        CancellationToken cancellationToken = default);

    Task<JobsStatsDto> GetJobsStatsAsync(
        CancellationToken cancellationToken = default);
}
