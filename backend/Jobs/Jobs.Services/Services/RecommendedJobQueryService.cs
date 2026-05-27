using Jobs.Contracts.DTOs;
using Jobs.Contracts.Parameters.RecommendedJobQuery;
using Jobs.Contracts.Results;
using Jobs.Contracts.Services;
using Jobs.DataAccess;
using Jobs.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Jobs.Services.Services;

public class RecommendedJobQueryService(JobsDbContext dbContext) : IRecommendedJobQueryService
{
    public async Task<RecommendedJobQueryResult> CreateAsync(CreateRecommendedJobQueryParameters parameters)
    {
        var queryText = parameters.Query?.Trim();
        if (string.IsNullOrWhiteSpace(queryText))
        {
            return new RecommendedJobQueryResult
            {
                Succeeded = false,
                Errors = ["Query is required."]
            };
        }

        var duplicateExists = await dbContext.RecommendedJobQueries
            .AsNoTracking()
            .AnyAsync(q => q.Query == queryText);

        if (duplicateExists)
        {
            return new RecommendedJobQueryResult
            {
                Succeeded = false,
                Errors = ["Recommended query already exists."]
            };
        }

        var query = new RecommendedJobQuery
        {
            Id = Guid.NewGuid(),
            Query = queryText,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.RecommendedJobQueries.Add(query);
        await dbContext.SaveChangesAsync();

        return new RecommendedJobQueryResult
        {
            Succeeded = true,
            RecommendedJobQuery = Map(query)
        };
    }

    public async Task<IReadOnlyCollection<RecommendedJobQueryDto>> GetRecommendedQueriesAsync(GetRecommendedJobQueriesParameters parameters)
    {
        var queries = await dbContext.RecommendedJobQueries
            .AsNoTracking()
            .OrderByDescending(q => q.CreatedAt)
            .Select(q => Map(q))
            .ToListAsync();

        return queries;
    }

    public async Task<RecommendedJobQueryResult> DeleteAsync(DeleteRecommendedJobQueryParameters parameters)
    {
        var query = await dbContext.RecommendedJobQueries
            .FirstOrDefaultAsync(q => q.Id == parameters.RecommendedQueryId);

        if (query is null)
        {
            return new RecommendedJobQueryResult
            {
                Succeeded = false,
                Errors = ["Recommended query not found."]
            };
        }

        dbContext.RecommendedJobQueries.Remove(query);
        await dbContext.SaveChangesAsync();

        return new RecommendedJobQueryResult
        {
            Succeeded = true,
            RecommendedJobQuery = Map(query)
        };
    }

    private static RecommendedJobQueryDto Map(RecommendedJobQuery query) =>
        new()
        {
            Id = query.Id,
            Query = query.Query,
            CreatedAt = query.CreatedAt
        };
}
