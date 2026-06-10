using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.Page;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.FileStorage.Contracts;
using Network.Contracts.Parameters.Page;

namespace Facade.NetworkManagement.Services.Services;

public partial class NetworkManagementService
{
    private static readonly string[] NetworkImageExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private static readonly string[] NetworkImageContentTypes =
        { "image/jpeg", "image/png", "image/webp", "image/gif" };
    public async Task<PageResponse> CreatePageAsync(string userId, CreatePageRequest request)
    {
        var result = await _networkClient.Pages.CreateAsync(new CreatePageParameters
        {
            OwnerId = userId,
            Name = request.Name,
            Description = request.Description,
            LogoUrl = request.LogoUrl
        });

        return MapPageResult(result);
    }

    public async Task<IReadOnlyCollection<PageDto>> GetMyPagesAsync(string userId)
    {
        var pages = await _networkClient.Pages.GetMyPagesAsync(new GetMyPagesParameters
        {
            OwnerId = userId
        });

        return pages.Select(MapPageToFacadeDto).ToList();
    }

    public async Task<PageDto?> GetMyPageByIdAsync(string userId, Guid pageId)
    {
        var page = await _networkClient.Pages.GetByIdAsync(new GetPageByIdParameters
        {
            UserId = userId,
            PageId = pageId
        });

        return page == null ? null : MapPageToFacadeDto(page);
    }

    public async Task<PageResponse> UpdatePageAsync(string userId, Guid pageId, UpdatePageRequest request)
    {
        var result = await _networkClient.Pages.UpdateAsync(new UpdatePageParameters
        {
            OwnerId = userId,
            PageId = pageId,
            Name = request.Name,
            Description = request.Description,
            LogoUrl = request.LogoUrl
        });

        return MapPageResult(result);
    }

    public async Task<PageResponse> UploadPageLogoAsync(
        string userId,
        Guid pageId,
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
                    ModuleName = "network",
                    EntityName = "page-logo",
                    OwnerId = userId,
                    EntityId = pageId.ToString(),
                    AllowedExtensions = NetworkImageExtensions,
                    AllowedContentTypes = NetworkImageContentTypes
                },
                cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return new PageResponse
            {
                Success = false,
                Errors = new[] { ex.Message }
            };
        }

        var existingPage = await GetMyPageByIdAsync(userId, pageId);

        if (existingPage == null)
        {
            return new PageResponse
            {
                Success = false,
                Errors = new[] { "Page not found." }
            };
        }

        return await UpdatePageAsync(
            userId,
            pageId,
            new UpdatePageRequest
            {
                Name = existingPage.Name,
                Description = existingPage.Description,
                LogoUrl = logoUrl
            });
    }

    public async Task<PageResponse> DeletePageAsync(string userId, Guid pageId)
    {
        var result = await _networkClient.Pages.DeleteAsync(new DeletePageParameters
        {
            OwnerId = userId,
            PageId = pageId
        });

        return MapPageResult(result);
    }
}
