using Facade.NetworkManagement.Contracts.Requests.Follow;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NetworkManagement.Controllers.Controllers;

public class NetworkFollowsController : NetworkManagementControllerBase
{
    public NetworkFollowsController(INetworkManagementService networkManagementService)
        : base(networkManagementService)
    {
    }

    // POST api/network/me/following
    [Authorize]
    [HttpPost("me/following")]
    [ProducesResponseType(typeof(FollowResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> FollowUser([FromBody] FollowUserRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.FollowUserAsync(userId, request);

        if (!response.Success)
            return MapFollowError(response);

        return Ok(response);
    }

    // DELETE api/network/me/following/{followingId}
    [Authorize]
    [HttpDelete("me/following/{followingId}")]
    [ProducesResponseType(typeof(FollowResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UnfollowUser(string followingId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.UnfollowUserAsync(userId, followingId);

        if (!response.Success)
            return MapFollowError(response);

        return Ok(response);
    }

    // GET api/network/me/following
    [Authorize]
    [HttpGet("me/following")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyFollowing()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var follows = await NetworkService.GetMyFollowingAsync(userId);

        return Ok(follows);
    }

    // GET api/network/me/followers
    [Authorize]
    [HttpGet("me/followers")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyFollowers()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var followers = await NetworkService.GetMyFollowersAsync(userId);

        return Ok(followers);
    }
}
