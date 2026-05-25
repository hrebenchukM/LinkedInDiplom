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
