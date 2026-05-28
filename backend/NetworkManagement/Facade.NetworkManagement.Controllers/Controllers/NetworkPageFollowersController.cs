using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NetworkManagement.Controllers.Controllers;

public class NetworkPageFollowersController : NetworkManagementControllerBase
{
    public NetworkPageFollowersController(INetworkManagementService networkManagementService)
        : base(networkManagementService)
    {
    }

    // POST api/network/me/pages/{pageId}/follow
    [Authorize]
    [HttpPost("me/pages/{pageId:guid}/follow")]
    [ProducesResponseType(typeof(PageFollowerResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> FollowPage(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.FollowPageAsync(userId, pageId);

        if (!response.Success)
            return MapPageFollowerError(response);

        return Ok(response);
    }

    // DELETE api/network/me/pages/{pageId}/follow
    [Authorize]
    [HttpDelete("me/pages/{pageId:guid}/follow")]
    [ProducesResponseType(typeof(PageFollowerResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UnfollowPage(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.UnfollowPageAsync(userId, pageId);

        if (!response.Success)
            return MapPageFollowerError(response);

        return Ok(response);
    }

    // GET api/network/me/pages/{pageId}/followers
    [Authorize]
    [HttpGet("me/pages/{pageId:guid}/followers")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetPageFollowers(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var followers = await NetworkService.GetPageFollowersAsync(userId, pageId);

        return Ok(followers);
    }
}
