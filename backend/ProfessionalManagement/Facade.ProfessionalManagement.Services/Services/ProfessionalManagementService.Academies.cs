using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Academy;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.FileStorage.Contracts;
using Facade.FileStorage.Contracts.Upload;
using Facade.Shared.Contracts.Pagination;
using Professional.Contracts.Parameters.Academy;

namespace Facade.ProfessionalManagement.Services.Services;

public partial class ProfessionalManagementService
{
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

    // Получить список учебных заведений в справочнике
    public async Task<PagedResponse<AcademyDto>> GetAcademiesAsync(
        GetAcademiesQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _professionalClient.Academies.GetAcademiesAsync(
            new GetAcademiesParameters
            {
                Skip = skip,
                Take = pageSize,
                Search = request.Search,
                SortBy = request.SortBy,
                SortDirection = request.SortDirection
            },
            cancellationToken);

        var items = result.Items
            .Select(MapAcademyToFacadeDto)
            .ToList();

        return Pagination.Create(items, page, pageSize, result.TotalCount);
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
        var existingAcademy = await GetAcademyByIdAsync(academyId);

        if (existingAcademy is null)
        {
            return new AcademyResponse
            {
                Success = false,
                Errors = new[] { "Academy not found." }
            };
        }

        var oldLogoUrl = existingAcademy.LogoUrl;

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
                    AllowedExtensions = FileUploadConstants.GeneralImageExtensions,
                    AllowedContentTypes = FileUploadConstants.GeneralImageContentTypes
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

        if (result.Succeeded)
            await _fileStorageService.DeleteAsync(oldLogoUrl, cancellationToken);

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
