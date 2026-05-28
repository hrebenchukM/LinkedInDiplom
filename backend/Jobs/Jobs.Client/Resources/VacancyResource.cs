using Jobs.Client.Contracts.Resources;
using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.Vacancy;
using Jobs.Contracts.Results;
using Jobs.Contracts.Services;

namespace Jobs.Client.Resources;

/// <summary>
/// Resource-адаптер для вакансий JobsClient.
/// Оставляет фасад слепым к DataAccess и деталям core-реализации.
/// </summary>
public class VacancyResource : IVacancyResource
{
    private readonly IVacancyService _vacancyService;

    public VacancyResource(IVacancyService vacancyService)
    {
        _vacancyService = vacancyService;
    }

    public Task<VacancyResult> CreateAsync(CreateVacancyParameters parameters)
    {
        return _vacancyService.CreateAsync(parameters);
    }

    public Task<IReadOnlyCollection<VacancyDto>> GetVacanciesAsync(GetVacanciesParameters parameters)
    {
        return _vacancyService.GetVacanciesAsync(parameters);
    }

    public Task<VacancyDto?> GetByIdAsync(GetVacancyByIdParameters parameters)
    {
        return _vacancyService.GetByIdAsync(parameters);
    }

    public Task<VacancyResult> UpdateAsync(UpdateVacancyParameters parameters)
    {
        return _vacancyService.UpdateAsync(parameters);
    }

    public Task<VacancyResult> DeleteAsync(DeleteVacancyParameters parameters)
    {
        return _vacancyService.DeleteAsync(parameters);
    }
}
