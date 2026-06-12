using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NetworkManagement.Controllers.Controllers;

public class NetworkGroupMembersController : NetworkManagementControllerBase
{
    public NetworkGroupMembersController(INetworkManagementService networkManagementService)
        : base(networkManagementService)
    {
    }

    // POST api/network/me/groups/{groupId}/join
    [Authorize]
    [HttpPost("me/groups/{groupId:guid}/join")]
    [ProducesResponseType(typeof(GroupMemberResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> JoinGroup(Guid groupId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.JoinGroupAsync(userId, groupId);

        if (!response.Success)
            return MapGroupMemberError(response);

        return Ok(response);
    }

    // DELETE api/network/me/groups/{groupId}/membership
    [Authorize]
    [HttpDelete("me/groups/{groupId:guid}/membership")]
    [ProducesResponseType(typeof(GroupMemberResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> LeaveGroup(Guid groupId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.LeaveGroupAsync(userId, groupId);

        if (!response.Success)
            return MapGroupMemberError(response);

        return Ok(response);
    }

    // GET api/network/me/groups/{groupId}/members
    [Authorize]
    [HttpGet("me/groups/{groupId:guid}/members")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetGroupMembers(Guid groupId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var members = await NetworkService.GetGroupMembersAsync(userId, groupId);

        return Ok(members);
    }
}
