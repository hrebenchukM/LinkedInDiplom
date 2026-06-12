using Facade.NetworkManagement.Contracts.Requests.PageAdmin;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NetworkManagement.Controllers.Controllers;

public class NetworkPageAdminsController : NetworkManagementControllerBase
{
    public NetworkPageAdminsController(INetworkManagementService networkManagementService)
        : base(networkManagementService)
    {
    }

    // POST api/network/me/pages/{pageId}/admins
    [Authorize]
    [HttpPost("me/pages/{pageId:guid}/admins")]
    [ProducesResponseType(typeof(PageAdminResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AddPageAdmin(
        Guid pageId,
        [FromBody] AddPageAdminRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.AddPageAdminAsync(userId, pageId, request);

        if (!response.Success)
            return MapPageAdminError(response);

        return Ok(response);
    }

    // DELETE api/network/me/pages/{pageId}/admins/{adminUserId}
    [Authorize]
    [HttpDelete("me/pages/{pageId:guid}/admins/{adminUserId}")]
    [ProducesResponseType(typeof(PageAdminResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RemovePageAdmin(Guid pageId, string adminUserId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.RemovePageAdminAsync(userId, pageId, adminUserId);

        if (!response.Success)
            return MapPageAdminError(response);

        return Ok(response);
    }

    // GET api/network/me/pages/{pageId}/admins
    [Authorize]
    [HttpGet("me/pages/{pageId:guid}/admins")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetPageAdmins(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var admins = await NetworkService.GetPageAdminsAsync(userId, pageId);

        return Ok(admins);
    }
}
