using Amazon.S3;
using Amazon.S3.Model;
using Facade.ProfileManagement.Contracts.DTOs;
using FacadeMessageSettingsDto = Facade.ProfileManagement.Contracts.DTOs.MessageSettingsDto;
using FacadeProfileViewDto = Facade.ProfileManagement.Contracts.DTOs.ProfileViewDto;
using Facade.ProfileManagement.Contracts.Options;
using Facade.ProfileManagement.Contracts.Responses;
using Facade.ProfileManagement.Contracts.Services;
using Microsoft.Extensions.Options;
using Profile.Client.Contracts;
using Profile.Contracts.DTOs;

namespace Facade.ProfileManagement.Services.Services;

/// <summary>
/// Facade service для Profile.
/// Работает как BFF-оркестратор: вызывает ProfileClient и возвращает модели, удобные для frontend.
/// </summary>
public partial class ProfileManagementService : IProfileManagementService
{
    private readonly IProfileClient _profileClient;
    private readonly UploadsOptions _uploadsOptions;
    private readonly AwsS3Settings _s3Settings;
    private readonly IAmazonS3? _s3Client;

        public ProfileManagementService(
        IProfileClient profileClient,
        IOptions<UploadsOptions> uploadsOptions,
        IOptions<AwsS3Settings> s3Settings,
        IAmazonS3? s3Client = null)
    {
        _profileClient = profileClient;
        _uploadsOptions = uploadsOptions.Value;
        _s3Settings = s3Settings.Value;
        _s3Client = s3Client;
    }

    private static ProfileDto MapProfileToFacadeDto(UserProfileDto profile)
    {
        return new ProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,

            FirstName = profile.FirstName,
            LastName = profile.LastName,
            FullName = profile.FullName,

            AvatarUrl = profile.AvatarUrl,
            HeaderUrl = profile.HeaderUrl,

            ProfileTitle = profile.ProfileTitle,
            Headline = profile.Headline,
            GenInfo = profile.GenInfo,

            University = profile.University,
            Location = profile.Location,
            PortfolioUrl = profile.PortfolioUrl,

            IsCompany = profile.IsCompany,

            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt
        };
    }

    private static FacadeMessageSettingsDto MapMessageSettingsToFacadeDto(
        Profile.Contracts.DTOs.MessageSettingsDto settings)
    {
        return new FacadeMessageSettingsDto
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

    private static FacadeProfileViewDto MapProfileViewToFacadeDto(Profile.Contracts.DTOs.ProfileViewDto view)
    {
        return new FacadeProfileViewDto
        {
            Id = view.Id,
            ProfileOwnerId = view.ProfileOwnerId,
            ViewerUserId = view.ViewerUserId,
            ViewerIp = view.ViewerIp,
            ViewerUserAgent = view.ViewerUserAgent,
            Source = view.Source,
            ViewedAt = view.ViewedAt
        };
    }
}