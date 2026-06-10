using Content.Contracts.DTOs;
using Facade.AdminManagement.Contracts.Requests;
using Facade.AdminManagement.Contracts.Services;
using Facade.Shared.Contracts.Pagination;
using Identity.Contracts.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.AdminManagement.Controllers.Controllers;

[ApiController]
[Route("api/admin/content")]
[Authorize(Roles = IdentityRoleNames.Admin)]
public class AdminContentController : AdminControllerBase
{
    private readonly IAdminManagementService _adminManagementService;

    public AdminContentController(IAdminManagementService adminManagementService)
    {
        _adminManagementService = adminManagementService;
    }

    [HttpGet("posts")]
    [ProducesResponseType(typeof(PagedResponse<AdminPostDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetAdminPosts(
        [FromQuery] AdminPostsQueryRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var posts = await _adminManagementService.GetAdminPostsAsync(request, cancellationToken);
            return Ok(posts);
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpDelete("posts/{postId:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> AdminSoftDeletePost(Guid postId, CancellationToken cancellationToken)
    {
        try
        {
            await _adminManagementService.AdminSoftDeletePostAsync(postId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpPatch("posts/{postId:guid}/restore")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> AdminRestorePost(Guid postId, CancellationToken cancellationToken)
    {
        try
        {
            await _adminManagementService.AdminRestorePostAsync(postId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }
}
