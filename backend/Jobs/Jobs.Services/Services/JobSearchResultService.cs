using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.JobSearchResult;
using Jobs.Contracts.Results;
using Jobs.Contracts.Services;
using Jobs.DataAccess;
using Jobs.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Jobs.Services.Services;

public class JobSearchResultService(JobsDbContext dbContext) : IJobSearchResultService
{
    public async Task<JobSearchResultResult> UpsertResultsAsync(UpsertJobSearchResultsParameters parameters)
    {
        var searchQuery = await dbContext.JobSearchQueries
            .AsNoTracking()
            .FirstOrDefaultAsync(q =>
                q.Id == parameters.SearchId &&
                q.UserId == parameters.UserId &&
                q.DeletedAt == null);

        if (searchQuery is null)
        {
            return new JobSearchResultResult
            {
                Succeeded = false,
                Errors = ["Search query not found."]
            };
        }

        var inputVacancyIds = parameters.VacancyIds
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        var activeVacancyIds = await dbContext.Vacancies
            .AsNoTracking()
            .Where(v => v.DeletedAt == null && inputVacancyIds.Contains(v.Id))
            .Select(v => v.Id)
            .ToListAsync();

        var existing = await dbContext.JobSearchResults
            .Where(r => r.SearchId == parameters.SearchId)
            .ToListAsync();

        var now = DateTime.UtcNow;

        for (var index = 0; index < activeVacancyIds.Count; index++)
        {
            var vacancyId = activeVacancyIds[index];
            var row = existing.FirstOrDefault(r => r.VacancyId == vacancyId);
            if (row is null)
            {
                dbContext.JobSearchResults.Add(new JobSearchResult
                {
                    Id = Guid.NewGuid(),
                    SearchId = parameters.SearchId,
                    VacancyId = vacancyId,
                    OrderIndex = index,
                    CreatedAt = now,
                    DeletedAt = null
                });
            }
            else
            {
                row.OrderIndex = index;
                row.DeletedAt = null;
            }
        }

        var activeSet = activeVacancyIds.ToHashSet();
        foreach (var row in existing.Where(r => !activeSet.Contains(r.VacancyId) && r.DeletedAt == null))
            row.DeletedAt = now;

        await dbContext.SaveChangesAsync();

        var firstResult = await dbContext.JobSearchResults
            .AsNoTracking()
            .Where(r => r.SearchId == parameters.SearchId && r.DeletedAt == null)
            .OrderBy(r => r.OrderIndex)
            .FirstOrDefaultAsync();

        return new JobSearchResultResult
        {
            Succeeded = true,
            JobSearchResult = firstResult is null ? null : Map(firstResult, null)
        };
    }

    public async Task<IReadOnlyCollection<JobSearchResultDto>> GetBySearchIdAsync(GetJobSearchResultsParameters parameters)
    {
        var searchQuery = await dbContext.JobSearchQueries
            .AsNoTracking()
            .FirstOrDefaultAsync(q =>
                q.Id == parameters.SearchId &&
                q.UserId == parameters.UserId &&
                q.DeletedAt == null);

        if (searchQuery is null)
            return Array.Empty<JobSearchResultDto>();

        var results = await dbContext.JobSearchResults
            .AsNoTracking()
            .Where(r => r.SearchId == parameters.SearchId && r.DeletedAt == null)
            .OrderBy(r => r.OrderIndex)
            .ToListAsync();

        var vacancyIds = results.Select(r => r.VacancyId).Distinct().ToList();
        var vacancies = await dbContext.Vacancies
            .AsNoTracking()
            .Where(v => v.DeletedAt == null && vacancyIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, v => v);

        return results
            .Select(r =>
            {
                vacancies.TryGetValue(r.VacancyId, out var vacancy);
                return Map(r, vacancy);
            })
            .ToList();
    }

    private static JobSearchResultDto Map(JobSearchResult result, Vacancy? vacancy) =>
        new()
        {
            Id = result.Id,
            SearchId = result.SearchId,
            VacancyId = result.VacancyId,
            OrderIndex = result.OrderIndex,
            CreatedAt = result.CreatedAt,
            Vacancy = vacancy is null
                ? null
                : new VacancyDto
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
                }
        };
}
