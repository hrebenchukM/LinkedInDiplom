using Facade.AdminManagement.Contracts.Services;
using Identity.Contracts.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.AdminManagement.Controllers.Controllers;

[ApiController]
[Route("api/admin/content")]
[Authorize(Roles = IdentityRoleNames.Admin)]
public class AdminContentController : ControllerBase
{
    private readonly IAdminManagementService _adminManagementService;

    public AdminContentController(IAdminManagementService adminManagementService)
    {
        _adminManagementService = adminManagementService;
    }

    [HttpDelete("posts/{postId:guid}")]
    [ProducesResponseType(204)]
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
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPatch("posts/{postId:guid}/restore")]
    [ProducesResponseType(204)]
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
            return BadRequest(new { error = ex.Message });
        }
    }
}
