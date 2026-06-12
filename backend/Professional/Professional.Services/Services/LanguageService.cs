using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Language;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис для работы с языками в справочнике
public class LanguageService : ILanguageService
{
    private readonly ProfessionalDbContext _dbContext;

    public LanguageService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить язык по Id
    public async Task<LanguageDto?> GetByIdAsync(GetLanguageByIdParameters parameters)
    {
        var language = await _dbContext.Languages
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == parameters.LanguageId);

        return language == null ? null : MapToDto(language);
    }

    // Получить список языков в справочнике
    public async Task<LanguagesResult> GetLanguagesAsync(
        GetLanguagesParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Languages.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var searchPattern = $"%{parameters.Search.Trim()}%";
            query = query.Where(l => EF.Functions.ILike(l.Name, searchPattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var sortBy = string.IsNullOrWhiteSpace(parameters.SortBy)
            ? "name"
            : parameters.SortBy.Trim();
        var descending = string.Equals(parameters.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = ApplySorting(query, sortBy, descending);

        var languages = await query
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync(cancellationToken);

        return new LanguagesResult
        {
            Items = languages.Select(MapToDto).ToList(),
            TotalCount = totalCount
        };
    }

    // Создать язык в справочнике
    public async Task<LanguageResult> CreateAsync(CreateLanguageParameters parameters)
    {
        if (string.IsNullOrWhiteSpace(parameters.Name))
        {
            return new LanguageResult
            {
                Succeeded = false,
                Errors = new[] { "Name is required." }
            };
        }

        var language = new Language
        {
            Id = Guid.NewGuid(),
            Name = parameters.Name,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Languages.Add(language);
        await _dbContext.SaveChangesAsync();

        return new LanguageResult
        {
            Succeeded = true,
            Language = MapToDto(language)
        };
    }

    private static IQueryable<Language> ApplySorting(
        IQueryable<Language> query,
        string sortBy,
        bool descending)
    {
        return sortBy.ToLowerInvariant() switch
        {
            "createdat" when descending => query.OrderByDescending(l => l.CreatedAt),
            "createdat" => query.OrderBy(l => l.CreatedAt),
            "name" when descending => query.OrderByDescending(l => l.Name),
            "name" => query.OrderBy(l => l.Name),
            _ when descending => query.OrderByDescending(l => l.Name),
            _ => query.OrderBy(l => l.Name)
        };
    }

    private static LanguageDto MapToDto(Language language)
    {
        return new LanguageDto
        {
            Id = language.Id,
            Name = language.Name,
            CreatedAt = language.CreatedAt
        };
    }
}
