using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.Page;
using Facade.NetworkManagement.Contracts.Responses;
using Network.Contracts.Parameters.Page;

namespace Facade.NetworkManagement.Services.Services;

public partial class NetworkManagementService
{
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
