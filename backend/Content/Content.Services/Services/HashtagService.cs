using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Hashtag;
using Content.Contracts.Results;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.Services.Services;

// Сервис хэштегов
public class HashtagService : IHashtagService
{
    private readonly ContentDbContext _dbContext;

    public HashtagService(ContentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HashtagResult> CreateAsync(CreateHashtagParameters parameters)
    {
        if (!TryNormalizeName(parameters.Name, out var normalizedName, out var nameError))
        {
            return Error(nameError!);
        }

        var existing = await _dbContext.Hashtags
            .AsNoTracking()
            .AnyAsync(h => h.Name == normalizedName);

        if (existing)
        {
            return Error("Hashtag already exists.");
        }

        var hashtag = new Hashtag
        {
            Id = Guid.NewGuid(),
            Name = normalizedName,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };

        _dbContext.Hashtags.Add(hashtag);
        await _dbContext.SaveChangesAsync();

        return Success(hashtag);
    }

    public async Task<HashtagDto?> GetByIdAsync(GetHashtagByIdParameters parameters)
    {
        var hashtag = await _dbContext.Hashtags
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == parameters.HashtagId);

        return hashtag == null ? null : MapToDto(hashtag);
    }

    public async Task<HashtagDto?> GetByNameAsync(GetHashtagByNameParameters parameters)
    {
        if (!TryNormalizeName(parameters.Name, out var normalizedName, out _))
        {
            return null;
        }

        var hashtag = await _dbContext.Hashtags
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Name == normalizedName);

        return hashtag == null ? null : MapToDto(hashtag);
    }

    private static bool TryNormalizeName(string name, out string normalizedName, out string? error)
    {
        normalizedName = name.Trim().ToLowerInvariant();

        if (string.IsNullOrEmpty(normalizedName))
        {
            error = "Hashtag name is required.";
            return false;
        }

        error = null;
        return true;
    }

    private static HashtagResult Success(Hashtag hashtag)
    {
        return new HashtagResult
        {
            Succeeded = true,
            Hashtag = MapToDto(hashtag)
        };
    }

    private static HashtagResult Error(string message)
    {
        return new HashtagResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static HashtagDto MapToDto(Hashtag hashtag)
    {
        return new HashtagDto
        {
            Id = hashtag.Id,
            Name = hashtag.Name,
            CreatedAt = hashtag.CreatedAt,
            UpdatedAt = hashtag.UpdatedAt
        };
    }
}
