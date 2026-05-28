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

    // POST api/network/me/pages
    [Authorize]
    [HttpPost("me/pages")]
    [ProducesResponseType(typeof(PageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreatePage([FromBody] CreatePageRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.CreatePageAsync(userId, request);

        if (!response.Success)
            return MapPageError(response);

        return Ok(response);
    }

    // GET api/network/me/pages
    [Authorize]
    [HttpGet("me/pages")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyPages()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var pages = await NetworkService.GetMyPagesAsync(userId);

        return Ok(pages);
    }

    // GET api/network/me/pages/following
    [Authorize]
    [HttpGet("me/pages/following")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyFollowedPages()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var pages = await NetworkService.GetMyFollowedPagesAsync(userId);

        return Ok(pages);
    }

    // GET api/network/me/pages/{pageId}
    [Authorize]
    [HttpGet("me/pages/{pageId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyPageById(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var page = await NetworkService.GetMyPageByIdAsync(userId, pageId);

        if (page == null)
            return NotFound();

        return Ok(page);
    }

    // PATCH api/network/me/pages/{pageId}
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
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.UpdatePageAsync(userId, pageId, request);

        if (!response.Success)
            return MapPageError(response);

        return Ok(response);
    }

    // DELETE api/network/me/pages/{pageId}
    [Authorize]
    [HttpDelete("me/pages/{pageId:guid}")]
    [ProducesResponseType(typeof(PageResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeletePage(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NetworkService.DeletePageAsync(userId, pageId);

        if (!response.Success)
            return MapPageError(response);

        return Ok(response);
    }
}
