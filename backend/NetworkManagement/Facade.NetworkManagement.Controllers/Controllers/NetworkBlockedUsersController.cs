using Facade.NetworkManagement.Contracts.Requests.BlockedUser;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NetworkManagement.Controllers.Controllers;

public class NetworkBlockedUsersController : NetworkManagementControllerBase
{
    public NetworkBlockedUsersController(INetworkManagementService networkManagementService)
        : base(networkManagementService)
    {
    }

    // POST api/network/me/blocked-users
    [Authorize]
    [HttpPost("me/blocked-users")]
    [ProducesResponseType(typeof(BlockedUserResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> BlockUser([FromBody] BlockUserRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.BlockUserAsync(userId, request);

        if (!response.Success)
            return MapBlockedUserError(response);

        return Ok(response);
    }

    // DELETE api/network/me/blocked-users/{blockedUserId}
    [Authorize]
    [HttpDelete("me/blocked-users/{blockedUserId}")]
    [ProducesResponseType(typeof(BlockedUserResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UnblockUser(string blockedUserId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.UnblockUserAsync(userId, blockedUserId);

        if (!response.Success)
            return MapBlockedUserError(response);

        return Ok(response);
    }

    // GET api/network/me/blocked-users
    [Authorize]
    [HttpGet("me/blocked-users")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyBlockedUsers()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var blocks = await NetworkService.GetMyBlockedUsersAsync(userId);

        return Ok(blocks);
    }
}
