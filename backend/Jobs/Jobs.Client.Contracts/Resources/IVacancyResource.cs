using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.Vacancy;
using Jobs.Contracts.Results;

namespace Jobs.Client.Contracts.Resources;

public interface IVacancyResource
{
    Task<VacancyResult> CreateAsync(CreateVacancyParameters parameters);
    Task<IReadOnlyCollection<VacancyDto>> GetVacanciesAsync(GetVacanciesParameters parameters);
    Task<VacancyDto?> GetByIdAsync(GetVacancyByIdParameters parameters);
    Task<VacancyResult> UpdateAsync(UpdateVacancyParameters parameters);
    Task<VacancyResult> DeleteAsync(DeleteVacancyParameters parameters);
}
