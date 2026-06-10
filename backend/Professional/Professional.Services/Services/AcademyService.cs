using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Academy;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис для работы с учебными заведениями
public class AcademyService : IAcademyService
{
    private readonly ProfessionalDbContext _dbContext;

    public AcademyService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить учебное заведение по Id
    public async Task<AcademyDto?> GetByIdAsync(GetAcademyByIdParameters parameters)
    {
        var academy = await _dbContext.Academies
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == parameters.AcademyId);

        return academy == null ? null : MapToDto(academy);
    }

    // Получить список учебных заведений в справочнике
    public async Task<AcademiesResult> GetAcademiesAsync(
        GetAcademiesParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Academies.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var searchPattern = $"%{parameters.Search.Trim()}%";
            query = query.Where(a => EF.Functions.ILike(a.Name, searchPattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var sortBy = string.IsNullOrWhiteSpace(parameters.SortBy)
            ? "name"
            : parameters.SortBy.Trim();
        var descending = string.Equals(parameters.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = ApplySorting(query, sortBy, descending);

        var academies = await query
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync(cancellationToken);

        return new AcademiesResult
        {
            Items = academies.Select(MapToDto).ToList(),
            TotalCount = totalCount
        };
    }

    // Создать учебное заведение
    public async Task<AcademyResult> CreateAsync(CreateAcademyParameters parameters)
    {
        if (string.IsNullOrWhiteSpace(parameters.Name))
        {
            return new AcademyResult
            {
                Succeeded = false,
                Errors = new[] { "Academy name is required." }
            };
        }

        var academy = new Academy
        {
            Id = Guid.NewGuid(),
            Name = parameters.Name,
            LogoUrl = parameters.LogoUrl,
            WebsiteUrl = parameters.WebsiteUrl,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Academies.Add(academy);
        await _dbContext.SaveChangesAsync();

        return new AcademyResult
        {
            Succeeded = true,
            Academy = MapToDto(academy)
        };
    }

    public async Task<AcademyResult> PatchAsync(PatchAcademyParameters parameters)
    {
        var academy = await _dbContext.Academies
            .FirstOrDefaultAsync(a => a.Id == parameters.AcademyId);

        if (academy == null)
        {
            return new AcademyResult
            {
                Succeeded = false,
                Errors = new[] { "Academy not found." }
            };
        }

        if (parameters.Name != null)
        {
            var name = parameters.Name.Trim();

            if (string.IsNullOrEmpty(name))
            {
                return new AcademyResult
                {
                    Succeeded = false,
                    Errors = new[] { "Academy name is required." }
                };
            }

            academy.Name = name;
        }

        academy.LogoUrl = parameters.LogoUrl ?? academy.LogoUrl;
        academy.WebsiteUrl = parameters.WebsiteUrl ?? academy.WebsiteUrl;
        academy.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new AcademyResult
        {
            Succeeded = true,
            Academy = MapToDto(academy)
        };
    }

    private static IQueryable<Academy> ApplySorting(
        IQueryable<Academy> query,
        string sortBy,
        bool descending)
    {
        return sortBy.ToLowerInvariant() switch
        {
            "createdat" when descending => query.OrderByDescending(a => a.CreatedAt),
            "createdat" => query.OrderBy(a => a.CreatedAt),
            "updatedat" when descending => query.OrderByDescending(a => a.UpdatedAt),
            "updatedat" => query.OrderBy(a => a.UpdatedAt),
            "name" when descending => query.OrderByDescending(a => a.Name),
            "name" => query.OrderBy(a => a.Name),
            _ when descending => query.OrderByDescending(a => a.Name),
            _ => query.OrderBy(a => a.Name)
        };
    }

    private static AcademyDto MapToDto(Academy academy)
    {
        return new AcademyDto
        {
            Id = academy.Id,
            Name = academy.Name,
            LogoUrl = academy.LogoUrl,
            WebsiteUrl = academy.WebsiteUrl,
            CreatedAt = academy.CreatedAt,
            UpdatedAt = academy.UpdatedAt
        };
    }
}
