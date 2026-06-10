using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Academy;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.FileStorage.Contracts;
using Professional.Contracts.Parameters.Academy;

namespace Facade.ProfessionalManagement.Services.Services;

public partial class ProfessionalManagementService
{
    private static readonly string[] AcademyLogoExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private static readonly string[] AcademyLogoContentTypes =
        { "image/jpeg", "image/png", "image/webp", "image/gif" };
    // Получить учебное заведение по Id
    public async Task<AcademyDto?> GetAcademyByIdAsync(Guid academyId)
    {
        var academy = await _professionalClient.Academies.GetByIdAsync(
            new GetAcademyByIdParameters
            {
                AcademyId = academyId
            });

        return academy == null ? null : MapAcademyToFacadeDto(academy);
    }

    // Создать учебное заведение
    public async Task<AcademyResponse> CreateAcademyAsync(CreateAcademyRequest request)
    {
        var result = await _professionalClient.Academies.CreateAsync(
            new CreateAcademyParameters
            {
                Name = request.Name,
                LogoUrl = request.LogoUrl,
                WebsiteUrl = request.WebsiteUrl
            });

        return new AcademyResponse
        {
            Success = result.Succeeded,
            Academy = result.Academy == null ? null : MapAcademyToFacadeDto(result.Academy),
            Errors = result.Errors
        };
    }

    public async Task<AcademyResponse> UploadAcademyLogoAsync(
        string userId,
        Guid academyId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        string logoUrl;

        try
        {
            logoUrl = await _fileStorageService.SaveAsync(
                fileStream,
                fileName,
                contentType,
                new FileStoragePathOptions
                {
                    ModuleName = "professional",
                    EntityName = "academy-logo",
                    OwnerId = userId,
                    EntityId = academyId.ToString(),
                    AllowedExtensions = AcademyLogoExtensions,
                    AllowedContentTypes = AcademyLogoContentTypes
                },
                cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return new AcademyResponse
            {
                Success = false,
                Errors = new[] { ex.Message }
            };
        }

        var result = await _professionalClient.Academies.PatchAsync(
            new PatchAcademyParameters
            {
                AcademyId = academyId,
                LogoUrl = logoUrl
            });

        return new AcademyResponse
        {
            Success = result.Succeeded,
            Academy = result.Academy == null ? null : MapAcademyToFacadeDto(result.Academy),
            Errors = result.Errors
        };
    }

    private static AcademyDto MapAcademyToFacadeDto(Professional.Contracts.DTOs.AcademyDto academy)
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
