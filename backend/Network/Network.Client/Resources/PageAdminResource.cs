using Network.Client.Contracts.Resources;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.PageAdmin;
using Network.Contracts.Results;
using Network.Contracts.Services;

namespace Network.Client.Resources;

// Реализация Resource для администраторов страниц.
// Делегирует вызовы в IPageAdminService.
public class PageAdminResource : IPageAdminResource
{
    private readonly IPageAdminService _pageAdminService;

    public PageAdminResource(IPageAdminService pageAdminService)
    {
        _pageAdminService = pageAdminService;
    }

    public Task<PageAdminResult> AddAdminAsync(AddPageAdminParameters parameters)
    {
        return _pageAdminService.AddAdminAsync(parameters);
    }

    public Task<PageAdminResult> RemoveAdminAsync(RemovePageAdminParameters parameters)
    {
        return _pageAdminService.RemoveAdminAsync(parameters);
    }

    public Task<IReadOnlyCollection<PageAdminDto>> GetPageAdminsAsync(GetPageAdminsParameters parameters)
    {
        return _pageAdminService.GetPageAdminsAsync(parameters);
    }
}
