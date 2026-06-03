using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NetworkManagement.Controllers.Controllers;

public class NetworkGroupPostsController : NetworkManagementControllerBase
{
    public NetworkGroupPostsController(INetworkManagementService networkManagementService)
        : base(networkManagementService)
    {
    }

    // POST api/network/me/groups/{groupId}/posts/{postId}
    [Authorize]
    [HttpPost("me/groups/{groupId:guid}/posts/{postId:guid}")]
    [ProducesResponseType(typeof(GroupPostResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AttachPostToGroup(Guid groupId, Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.AttachPostToGroupAsync(userId, groupId, postId);

        if (!response.Success)
            return MapGroupPostError(response);

        return Ok(response);
    }

    // DELETE api/network/me/groups/{groupId}/posts/{postId}
    [Authorize]
    [HttpDelete("me/groups/{groupId:guid}/posts/{postId:guid}")]
    [ProducesResponseType(typeof(GroupPostResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DetachPostFromGroup(Guid groupId, Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.DetachPostFromGroupAsync(userId, groupId, postId);

        if (!response.Success)
            return MapGroupPostError(response);

        return Ok(response);
    }

    // GET api/network/me/groups/{groupId}/posts
    [Authorize]
    [HttpGet("me/groups/{groupId:guid}/posts")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetGroupPosts(Guid groupId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var groupPosts = await NetworkService.GetGroupPostsAsync(userId, groupId);

        if (groupPosts == null)
            return NotFoundError(GroupPostNotFoundError);

        return Ok(groupPosts);
    }
}
