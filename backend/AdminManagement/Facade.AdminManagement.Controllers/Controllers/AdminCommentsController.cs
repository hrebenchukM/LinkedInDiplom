using Content.Contracts.DTOs;
using Facade.AdminManagement.Contracts.Requests;
using Facade.AdminManagement.Contracts.Services;
using Facade.Shared.Contracts.Pagination;
using Identity.Contracts.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.AdminManagement.Controllers.Controllers;

[ApiController]
[Route("api/admin/content/comments")]
[Authorize(Roles = IdentityRoleNames.Admin)]
public class AdminCommentsController : AdminControllerBase
{
    private readonly IAdminManagementService _adminManagementService;

    public AdminCommentsController(IAdminManagementService adminManagementService)
    {
        _adminManagementService = adminManagementService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<AdminCommentDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> GetAdminComments(
        [FromQuery] AdminCommentsQueryRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var comments = await _adminManagementService.GetAdminCommentsAsync(request, cancellationToken);
            return Ok(comments);
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpDelete("{commentId:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AdminSoftDeleteComment(Guid commentId, CancellationToken cancellationToken)
    {
        try
        {
            await _adminManagementService.AdminSoftDeleteCommentAsync(commentId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpPatch("{commentId:guid}/restore")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AdminRestoreComment(Guid commentId, CancellationToken cancellationToken)
    {
        try
        {
            await _adminManagementService.AdminRestoreCommentAsync(commentId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }
}
