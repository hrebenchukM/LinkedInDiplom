using Microsoft.EntityFrameworkCore;
using Professional.Contracts.DTOs;
using Professional.Contracts.Parameters.Recommendation;
using Professional.Contracts.Results;
using Professional.Contracts.Services;
using Professional.DataAccess;
using Professional.DataAccess.Entities;

namespace Professional.Services.Services;

// Сервис текстовых рекомендаций между пользователями
public class RecommendationService : IRecommendationService
{
    private readonly ProfessionalDbContext _dbContext;

    public RecommendationService(ProfessionalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить активные рекомендации для получателя
    public async Task<IReadOnlyCollection<RecommendationDto>> GetRecommendationsForUserAsync(
        GetRecommendationsForUserParameters parameters)
    {
        var recommendations = await _dbContext.Recommendations
            .AsNoTracking()
            .Where(r => r.UserId == parameters.UserId && r.DeletedAt == null)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return recommendations
            .Select(MapToDto)
            .ToList();
    }

    // Получить одну активную рекомендацию по Id
    public async Task<RecommendationDto?> GetByIdAsync(GetRecommendationByIdParameters parameters)
    {
        var recommendation = await _dbContext.Recommendations
            .AsNoTracking()
            .FirstOrDefaultAsync(r =>
                r.Id == parameters.RecommendationId &&
                r.DeletedAt == null);

        return recommendation == null ? null : MapToDto(recommendation);
    }

    // Создать рекомендацию
    public async Task<RecommendationResult> CreateAsync(CreateRecommendationParameters parameters)
    {
        if (string.IsNullOrWhiteSpace(parameters.AuthorId))
        {
            return new RecommendationResult
            {
                Succeeded = false,
                Errors = new[] { "AuthorId is required." }
            };
        }

        if (string.IsNullOrWhiteSpace(parameters.UserId))
        {
            return new RecommendationResult
            {
                Succeeded = false,
                Errors = new[] { "UserId is required." }
            };
        }

        var text = NormalizeText(parameters.Text);
        if (text == null)
        {
            return new RecommendationResult
            {
                Succeeded = false,
                Errors = new[] { "Text is required." }
            };
        }

        if (parameters.AuthorId == parameters.UserId)
        {
            return new RecommendationResult
            {
                Succeeded = false,
                Errors = new[] { "You cannot write a recommendation for yourself." }
            };
        }

        var recommendation = new Recommendation
        {
            Id = Guid.NewGuid(),
            AuthorId = parameters.AuthorId,
            UserId = parameters.UserId,
            Text = text,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null,
            DeletedAt = null
        };

        _dbContext.Recommendations.Add(recommendation);
        await _dbContext.SaveChangesAsync();

        return new RecommendationResult
        {
            Succeeded = true,
            Recommendation = MapToDto(recommendation)
        };
    }

    // Обновить текст рекомендации (только автор)
    public async Task<RecommendationResult> PatchAsync(PatchRecommendationParameters parameters)
    {
        var recommendation = await _dbContext.Recommendations
            .FirstOrDefaultAsync(r =>
                r.Id == parameters.RecommendationId &&
                r.AuthorId == parameters.AuthorId &&
                r.DeletedAt == null);

        if (recommendation == null)
        {
            return new RecommendationResult
            {
                Succeeded = false,
                Errors = new[] { "Recommendation not found." }
            };
        }

        var text = NormalizeText(parameters.Text);
        if (text == null)
        {
            return new RecommendationResult
            {
                Succeeded = false,
                Errors = new[] { "Text is required." }
            };
        }

        recommendation.Text = text;
        recommendation.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new RecommendationResult
        {
            Succeeded = true,
            Recommendation = MapToDto(recommendation)
        };
    }

    // Soft delete рекомендации (только автор)
    public async Task<RecommendationResult> DeleteAsync(DeleteRecommendationParameters parameters)
    {
        var recommendation = await _dbContext.Recommendations
            .FirstOrDefaultAsync(r =>
                r.Id == parameters.RecommendationId &&
                r.AuthorId == parameters.AuthorId &&
                r.DeletedAt == null);

        if (recommendation == null)
        {
            return new RecommendationResult
            {
                Succeeded = false,
                Errors = new[] { "Recommendation not found." }
            };
        }

        recommendation.DeletedAt = DateTime.UtcNow;
        recommendation.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new RecommendationResult
        {
            Succeeded = true,
            Recommendation = MapToDto(recommendation)
        };
    }

    private static string? NormalizeText(string? text)
    {
        if (text == null)
            return null;

        var trimmed = text.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static RecommendationDto MapToDto(Recommendation recommendation)
    {
        return new RecommendationDto
        {
            Id = recommendation.Id,
            AuthorId = recommendation.AuthorId,
            UserId = recommendation.UserId,
            Text = recommendation.Text,
            CreatedAt = recommendation.CreatedAt,
            UpdatedAt = recommendation.UpdatedAt
        };
    }
}
