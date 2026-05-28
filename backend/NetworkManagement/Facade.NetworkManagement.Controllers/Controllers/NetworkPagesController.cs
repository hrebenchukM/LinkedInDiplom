using Facade.NetworkManagement.Contracts.Requests.Page;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NetworkManagement.Controllers.Controllers;

public class NetworkPagesController : NetworkManagementControllerBase
{
    public NetworkPagesController(INetworkManagementService networkManagementService)
        : base(networkManagementService)
    {
    }

    [Authorize]
    [HttpPost("me/pages")]
    [ProducesResponseType(typeof(PageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreatePage([FromBody] CreatePageRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await NetworkService.CreatePageAsync(userId, request);

        if (!response.Success)
        {
            return MapPageError(response);
        }

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/pages")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyPages()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var items = await NetworkService.GetMyPagesAsync(userId);

        return Ok(items);
    }

    [Authorize]
    [HttpGet("me/pages/following")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyFollowedPages()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var items = await NetworkService.GetMyFollowedPagesAsync(userId);

        return Ok(items);
    }

    [Authorize]
    [HttpGet("me/pages/{pageId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyPageById(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var item = await NetworkService.GetMyPageByIdAsync(userId, pageId);

        if (item == null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [Authorize]
    [HttpPatch("me/pages/{pageId:guid}")]
    [ProducesResponseType(typeof(PageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdatePage(
        Guid pageId,
        [FromBody] UpdatePageRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await NetworkService.UpdatePageAsync(userId, pageId, request);

        if (!response.Success)
        {
            return MapPageError(response);
        }

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/pages/{pageId:guid}")]
    [ProducesResponseType(typeof(PageResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeletePage(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await NetworkService.DeletePageAsync(userId, pageId);

        if (!response.Success)
        {
            return MapPageError(response);
        }

        return Ok(response);
    }
}
