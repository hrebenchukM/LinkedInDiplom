using Network.Client.Contracts.Resources;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.Page;
using Network.Contracts.Results;
using Network.Contracts.Services;

namespace Network.Client.Resources;

// Реализация Resource для страниц.
// Делегирует вызовы в IPageService.
public class PageResource : IPageResource
{
    private readonly IPageService _pageService;

    public PageResource(IPageService pageService)
    {
        _pageService = pageService;
    }

    public Task<PageResult> CreateAsync(CreatePageParameters parameters)
    {
        return _pageService.CreateAsync(parameters);
    }

    public Task<IReadOnlyCollection<PageDto>> GetMyPagesAsync(GetMyPagesParameters parameters)
    {
        return _pageService.GetMyPagesAsync(parameters);
    }

    public Task<PageDto?> GetByIdAsync(GetPageByIdParameters parameters)
    {
        return _pageService.GetByIdAsync(parameters);
    }

    public Task<PageResult> UpdateAsync(UpdatePageParameters parameters)
    {
        return _pageService.UpdateAsync(parameters);
    }

    public Task<PageResult> DeleteAsync(DeletePageParameters parameters)
    {
        return _pageService.DeleteAsync(parameters);
    }
}
