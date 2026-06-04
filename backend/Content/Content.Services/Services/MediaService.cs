using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Media;
using Content.Contracts.Results;
using Content.Contracts.Services;
using Content.DataAccess;
using Content.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Content.Services.Services;

// Сервис медиа (URL/reference, без blob)
public class MediaService : IMediaService
{
    private const string TypeImage = "image";
    private const string TypeVideo = "video";
    private const string TypeDocument = "document";

    private readonly ContentDbContext _dbContext;

    public MediaService(ContentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<MediaResult> CreateAsync(CreateMediaParameters parameters)
    {
        var url = parameters.Url.Trim();

        if (string.IsNullOrEmpty(url))
        {
            return Error("Media url is required.");
        }

        var type = parameters.Type.Trim();

        if (string.IsNullOrEmpty(type))
        {
            return Error("Media type is required.");
        }

        if (!TryNormalizeMediaType(type, out var normalizedType, out var typeError))
        {
            return Error(typeError!);
        }

        var media = new Media
        {
            Id = Guid.NewGuid(),
            Url = url,
            Type = normalizedType,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Media.Add(media);
        await _dbContext.SaveChangesAsync();

        return Success(media);
    }

    public async Task<MediaDto?> GetByIdAsync(GetMediaByIdParameters parameters)
    {
        var media = await _dbContext.Media
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == parameters.MediaId);

        return media == null ? null : MapToDto(media);
    }

    private static bool TryNormalizeMediaType(
        string type,
        out string normalized,
        out string? error)
    {
        var value = type.ToLowerInvariant();

        if (value is not (TypeImage or TypeVideo or TypeDocument))
        {
            normalized = default!;
            error = "Invalid media type.";
            return false;
        }

        normalized = value;
        error = null;
        return true;
    }

    private static MediaResult Success(Media media)
    {
        return new MediaResult
        {
            Succeeded = true,
            Media = MapToDto(media)
        };
    }

    private static MediaResult Error(string message)
    {
        return new MediaResult
        {
            Succeeded = false,
            Errors = new[] { message }
        };
    }

    private static MediaDto MapToDto(Media media)
    {
        return new MediaDto
        {
            Id = media.Id,
            Url = media.Url,
            Type = media.Type,
            CreatedAt = media.CreatedAt
        };
    }
}
