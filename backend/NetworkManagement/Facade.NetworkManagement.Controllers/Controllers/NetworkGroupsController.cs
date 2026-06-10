using Facade.NetworkManagement.Contracts.Requests.Group;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NetworkManagement.Controllers.Controllers;

public class NetworkGroupsController : NetworkManagementControllerBase
{
    public NetworkGroupsController(INetworkManagementService networkManagementService)
        : base(networkManagementService)
    {
    }

    // POST api/network/me/groups
    [Authorize]
    [HttpPost("me/groups")]
    [ProducesResponseType(typeof(UserGroupResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateUserGroup([FromBody] CreateUserGroupRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.CreateUserGroupAsync(userId, request);

        if (!response.Success)
            return MapUserGroupError(response);

        return Ok(response);
    }

    // GET api/network/me/groups
    [Authorize]
    [HttpGet("me/groups")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyUserGroups()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var groups = await NetworkService.GetMyUserGroupsAsync(userId);

        return Ok(groups);
    }

    // GET api/network/me/groups/{groupId}
    [Authorize]
    [HttpGet("me/groups/{groupId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyUserGroupById(Guid groupId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var group = await NetworkService.GetMyUserGroupByIdAsync(userId, groupId);

        if (group == null)
            return NotFoundError(GroupNotFoundError);

        return Ok(group);
    }

    // PATCH api/network/me/groups/{groupId}
    [Authorize]
    [HttpPatch("me/groups/{groupId:guid}")]
    [ProducesResponseType(typeof(UserGroupResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateUserGroup(
        Guid groupId,
        [FromBody] UpdateUserGroupRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.UpdateUserGroupAsync(userId, groupId, request);

        if (!response.Success)
            return MapUserGroupError(response);

        return Ok(response);
    }

    // POST api/network/me/groups/{groupId}/avatar
    [Authorize]
    [HttpPost("me/groups/{groupId:guid}/avatar")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(UserGroupResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UploadGroupAvatar(
        Guid groupId,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        if (file == null || file.Length == 0)
            return MediaBadRequest("File is empty.");
        if (file.Length > 5 * 1024 * 1024)
            return MediaBadRequest("File is too large. Maximum size is 5 MB.");

        await using var stream = file.OpenReadStream();

        var response = await NetworkService.UploadGroupAvatarAsync(
            userId,
            groupId,
            stream,
            file.FileName,
            file.ContentType,
            cancellationToken);

        if (!response.Success)
            return MapUserGroupError(response);

        return Ok(response);
    }

    // DELETE api/network/me/groups/{groupId}
    [Authorize]
    [HttpDelete("me/groups/{groupId:guid}")]
    [ProducesResponseType(typeof(UserGroupResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteUserGroup(Guid groupId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.DeleteUserGroupAsync(userId, groupId);

        if (!response.Success)
            return MapUserGroupError(response);

        return Ok(response);
    }

    private static IActionResult MediaBadRequest(string message) =>
        new BadRequestObjectResult(new { success = false, errors = new[] { message } });
}
