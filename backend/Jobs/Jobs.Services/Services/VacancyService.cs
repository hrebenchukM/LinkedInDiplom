using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.Vacancy;
using Jobs.Contracts.Results;
using Jobs.Contracts.Services;
using Jobs.DataAccess;
using Jobs.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Jobs.Services.Services;

/// <summary>
/// Core service модуля Jobs для вакансий.
/// Содержит правила валидации, ownership и soft delete вакансий.
/// </summary>
public class VacancyService(JobsDbContext dbContext) : IVacancyService
{
    public async Task<VacancyResult> CreateAsync(CreateVacancyParameters parameters)
    {
        var title = parameters.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return new VacancyResult
            {
                Succeeded = false,
                Errors = ["Vacancy title is required."]
            };
        }

        var vacancy = new Vacancy
        {
            Id = Guid.NewGuid(),
            CompanyId = parameters.CompanyId,
            PostedBy = parameters.UserId,
            Title = title,
            JobType = Normalize(parameters.JobType),
            Schedule = Normalize(parameters.Schedule),
            Location = Normalize(parameters.Location),
            SalaryFrom = parameters.SalaryFrom,
            SalaryTo = parameters.SalaryTo,
            SalaryCurrency = Normalize(parameters.SalaryCurrency),
            Description = Normalize(parameters.Description),
            PostedAt = DateTime.UtcNow,
            UpdatedAt = null,
            DeletedAt = null
        };

        dbContext.Vacancies.Add(vacancy);
        await dbContext.SaveChangesAsync();

        return new VacancyResult
        {
            Succeeded = true,
            Vacancy = Map(vacancy)
        };
    }

    public async Task<IReadOnlyCollection<VacancyDto>> GetVacanciesAsync(GetVacanciesParameters parameters)
    {
        var query = dbContext.Vacancies
            .AsNoTracking()
            .Where(v => v.DeletedAt == null);

        if (parameters.CompanyId.HasValue)
            query = query.Where(v => v.CompanyId == parameters.CompanyId.Value);

        var searchText = Normalize(parameters.Query);
        if (!string.IsNullOrWhiteSpace(searchText))
            query = query.Where(v => v.Title.Contains(searchText));

        var location = Normalize(parameters.Location);
        if (!string.IsNullOrWhiteSpace(location))
            query = query.Where(v => v.Location != null && v.Location.Contains(location));

        var vacancies = await query
            .OrderByDescending(v => v.PostedAt)
            .Select(v => Map(v))
            .ToListAsync();

        return vacancies;
    }

    public async Task<VacancyDto?> GetByIdAsync(GetVacancyByIdParameters parameters)
    {
        var vacancy = await dbContext.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == parameters.VacancyId && v.DeletedAt == null);

        return vacancy is null ? null : Map(vacancy);
    }

    public async Task<VacancyResult> UpdateAsync(UpdateVacancyParameters parameters)
    {
        var vacancy = await dbContext.Vacancies
            .FirstOrDefaultAsync(v => v.Id == parameters.VacancyId && v.DeletedAt == null && v.PostedBy == parameters.UserId);

        if (vacancy is null)
        {
            return new VacancyResult
            {
                Succeeded = false,
                Errors = ["Vacancy not found."]
            };
        }

        var title = parameters.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return new VacancyResult
            {
                Succeeded = false,
                Errors = ["Vacancy title is required."]
            };
        }

        vacancy.CompanyId = parameters.CompanyId;
        vacancy.Title = title;
        vacancy.JobType = Normalize(parameters.JobType);
        vacancy.Schedule = Normalize(parameters.Schedule);
        vacancy.Location = Normalize(parameters.Location);
        vacancy.SalaryFrom = parameters.SalaryFrom;
        vacancy.SalaryTo = parameters.SalaryTo;
        vacancy.SalaryCurrency = Normalize(parameters.SalaryCurrency);
        vacancy.Description = Normalize(parameters.Description);
        vacancy.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return new VacancyResult
        {
            Succeeded = true,
            Vacancy = Map(vacancy)
        };
    }

    public async Task<VacancyResult> DeleteAsync(DeleteVacancyParameters parameters)
    {
        var vacancy = await dbContext.Vacancies
            .FirstOrDefaultAsync(v => v.Id == parameters.VacancyId && v.DeletedAt == null && v.PostedBy == parameters.UserId);

        if (vacancy is null)
        {
            return new VacancyResult
            {
                Succeeded = false,
                Errors = ["Vacancy not found."]
            };
        }

        var now = DateTime.UtcNow;
        vacancy.DeletedAt = now;
        vacancy.UpdatedAt = now;

        await dbContext.SaveChangesAsync();

        return new VacancyResult
        {
            Succeeded = true,
            Vacancy = Map(vacancy)
        };
    }

    private static VacancyDto Map(Vacancy vacancy) =>
        new()
        {
            Id = vacancy.Id,
            CompanyId = vacancy.CompanyId,
            PostedBy = vacancy.PostedBy,
            Title = vacancy.Title,
            JobType = vacancy.JobType,
            Schedule = vacancy.Schedule,
            Location = vacancy.Location,
            SalaryFrom = vacancy.SalaryFrom,
            SalaryTo = vacancy.SalaryTo,
            SalaryCurrency = vacancy.SalaryCurrency,
            Description = vacancy.Description,
            PostedAt = vacancy.PostedAt,
            UpdatedAt = vacancy.UpdatedAt
        };

    private static string? Normalize(string? value)
    {
        if (value is null)
            return null;

        var trimmed = value.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }
}
