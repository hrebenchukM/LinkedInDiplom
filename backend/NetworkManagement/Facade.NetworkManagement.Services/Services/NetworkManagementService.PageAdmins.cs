using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.PageAdmin;
using Facade.NetworkManagement.Contracts.Responses;
using Network.Contracts.Parameters.PageAdmin;

namespace Facade.NetworkManagement.Services.Services;

public partial class NetworkManagementService
{
    public async Task<PageAdminResponse> AddPageAdminAsync(
        string userId,
        Guid pageId,
        AddPageAdminRequest request)
    {
        var result = await _networkClient.PageAdmins.AddAdminAsync(new AddPageAdminParameters
        {
            OwnerId = userId,
            PageId = pageId,
            UserId = request.UserId
        });

        return MapPageAdminResult(result);
    }

    public async Task<PageAdminResponse> RemovePageAdminAsync(
        string userId,
        Guid pageId,
        string adminUserId)
    {
        var result = await _networkClient.PageAdmins.RemoveAdminAsync(new RemovePageAdminParameters
        {
            OwnerId = userId,
            PageId = pageId,
            UserId = adminUserId
        });

        return MapPageAdminResult(result);
    }

    public async Task<IReadOnlyCollection<PageAdminDto>> GetPageAdminsAsync(string userId, Guid pageId)
    {
        var admins = await _networkClient.PageAdmins.GetPageAdminsAsync(new GetPageAdminsParameters
        {
            UserId = userId,
            PageId = pageId
        });

        return admins.Select(MapPageAdminToFacadeDto).ToList();
    }
}
