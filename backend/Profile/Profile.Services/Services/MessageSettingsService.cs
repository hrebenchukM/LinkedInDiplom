using Microsoft.EntityFrameworkCore;
using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters.MessageSettings;
using Profile.Contracts.Results;
using Profile.Contracts.Services;
using Profile.DataAccess;
using Profile.DataAccess.Entities;

namespace Profile.Services.Services;

// Сервис настроек сообщений пользователя
public class MessageSettingsService : IMessageSettingsService
{
    private readonly ProfileDbContext _dbContext;

    public MessageSettingsService(ProfileDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Получить свои настройки; если записи нет — создать defaults
    public async Task<MessageSettingsDto> GetMyMessageSettingsAsync(GetMyMessageSettingsParameters parameters)
    {
        var settings = await _dbContext.MessageSettings
            .FirstOrDefaultAsync(ms => ms.UserId == parameters.UserId);

        if (settings != null)
            return MapToDto(settings);

        settings = CreateDefaultEntity(parameters.UserId);
        _dbContext.MessageSettings.Add(settings);
        await _dbContext.SaveChangesAsync();

        return MapToDto(settings);
    }

    // Полное обновление настроек (PUT)
    public async Task<MessageSettingsResult> UpdateMyMessageSettingsAsync(
        UpdateMessageSettingsParameters parameters)
    {
        var settings = await _dbContext.MessageSettings
            .FirstOrDefaultAsync(ms => ms.UserId == parameters.UserId);

        if (settings == null)
        {
            settings = new MessageSettings
            {
                Id = Guid.NewGuid(),
                UserId = parameters.UserId,
                OfficeAbsenceEnabled = parameters.OfficeAbsenceEnabled,
                OfficeAbsenceMessage = parameters.OfficeAbsenceMessage,
                NotificationsEnabled = parameters.NotificationsEnabled,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.MessageSettings.Add(settings);
        }
        else
        {
            settings.OfficeAbsenceEnabled = parameters.OfficeAbsenceEnabled;
            settings.OfficeAbsenceMessage = parameters.OfficeAbsenceMessage;
            settings.NotificationsEnabled = parameters.NotificationsEnabled;
            settings.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync();

        return new MessageSettingsResult
        {
            Succeeded = true,
            MessageSettings = MapToDto(settings)
        };
    }

    // Частичное обновление настроек (PATCH)
    public async Task<MessageSettingsResult> PatchMyMessageSettingsAsync(
        PatchMessageSettingsParameters parameters)
    {
        var settings = await _dbContext.MessageSettings
            .FirstOrDefaultAsync(ms => ms.UserId == parameters.UserId);

        if (settings == null)
        {
            settings = CreateDefaultEntity(parameters.UserId);
            _dbContext.MessageSettings.Add(settings);
        }

        if (parameters.OfficeAbsenceEnabled.HasValue)
            settings.OfficeAbsenceEnabled = parameters.OfficeAbsenceEnabled.Value;

        if (parameters.OfficeAbsenceMessage != null)
            settings.OfficeAbsenceMessage = parameters.OfficeAbsenceMessage;

        if (parameters.NotificationsEnabled.HasValue)
            settings.NotificationsEnabled = parameters.NotificationsEnabled.Value;

        settings.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return new MessageSettingsResult
        {
            Succeeded = true,
            MessageSettings = MapToDto(settings)
        };
    }

    private static MessageSettings CreateDefaultEntity(string userId)
    {
        return new MessageSettings
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OfficeAbsenceEnabled = false,
            OfficeAbsenceMessage = null,
            NotificationsEnabled = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };
    }

    private static MessageSettingsDto MapToDto(MessageSettings settings)
    {
        return new MessageSettingsDto
        {
            Id = settings.Id,
            UserId = settings.UserId,
            OfficeAbsenceEnabled = settings.OfficeAbsenceEnabled,
            OfficeAbsenceMessage = settings.OfficeAbsenceMessage,
            NotificationsEnabled = settings.NotificationsEnabled,
            CreatedAt = settings.CreatedAt,
            UpdatedAt = settings.UpdatedAt
        };
    }
}
