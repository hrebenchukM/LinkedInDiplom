using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.JobSearchQuery;
using Jobs.Contracts.Results;
using Jobs.Contracts.Services;
using Jobs.DataAccess;
using Jobs.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Jobs.Services.Services;

public class JobSearchQueryService(JobsDbContext dbContext) : IJobSearchQueryService
{
    public async Task<JobSearchQueryResult> CreateAsync(CreateJobSearchQueryParameters parameters)
    {
        var searchQuery = new JobSearchQuery
        {
            Id = Guid.NewGuid(),
            UserId = parameters.UserId,
            Query = Normalize(parameters.Query),
            Location = Normalize(parameters.Location),
            Radius = parameters.Radius,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null,
            DeletedAt = null
        };

        dbContext.JobSearchQueries.Add(searchQuery);
        await dbContext.SaveChangesAsync();

        return new JobSearchQueryResult
        {
            Succeeded = true,
            JobSearchQuery = Map(searchQuery)
        };
    }

    public async Task<IReadOnlyCollection<JobSearchQueryDto>> GetMySearchQueriesAsync(GetMyJobSearchQueriesParameters parameters)
    {
        var queries = await dbContext.JobSearchQueries
            .AsNoTracking()
            .Where(q => q.UserId == parameters.UserId && q.DeletedAt == null)
            .OrderByDescending(q => q.CreatedAt)
            .Select(q => Map(q))
            .ToListAsync();

        return queries;
    }

    public async Task<JobSearchQueryDto?> GetByIdAsync(GetJobSearchQueryByIdParameters parameters)
    {
        var query = await dbContext.JobSearchQueries
            .AsNoTracking()
            .FirstOrDefaultAsync(q =>
                q.Id == parameters.SearchId &&
                q.UserId == parameters.UserId &&
                q.DeletedAt == null);

        return query is null ? null : Map(query);
    }

    public async Task<JobSearchQueryResult> DeleteAsync(DeleteJobSearchQueryParameters parameters)
    {
        var query = await dbContext.JobSearchQueries
            .FirstOrDefaultAsync(q =>
                q.Id == parameters.SearchId &&
                q.UserId == parameters.UserId &&
                q.DeletedAt == null);

        if (query is null)
        {
            return new JobSearchQueryResult
            {
                Succeeded = false,
                Errors = ["Search query not found."]
            };
        }

        var now = DateTime.UtcNow;
        query.DeletedAt = now;
        query.UpdatedAt = now;

        await dbContext.SaveChangesAsync();

        return new JobSearchQueryResult
        {
            Succeeded = true,
            JobSearchQuery = Map(query)
        };
    }

    private static JobSearchQueryDto Map(JobSearchQuery query) =>
        new()
        {
            Id = query.Id,
            UserId = query.UserId,
            Query = query.Query,
            Location = query.Location,
            Radius = query.Radius,
            CreatedAt = query.CreatedAt,
            UpdatedAt = query.UpdatedAt
        };

    private static string? Normalize(string? value)
    {
        if (value is null)
            return null;

        var trimmed = value.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }
}
