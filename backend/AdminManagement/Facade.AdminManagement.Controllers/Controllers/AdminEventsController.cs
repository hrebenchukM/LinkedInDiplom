using Events.Contracts.DTOs;
using Facade.AdminManagement.Contracts.Requests;
using Facade.AdminManagement.Contracts.Services;
using Facade.Shared.Contracts.Pagination;
using Identity.Contracts.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.AdminManagement.Controllers.Controllers;

[ApiController]
[Route("api/admin/events")]
[Authorize(Roles = IdentityRoleNames.Admin)]
public class AdminEventsController : AdminControllerBase
{
    private readonly IAdminManagementService _adminManagementService;

    public AdminEventsController(IAdminManagementService adminManagementService)
    {
        _adminManagementService = adminManagementService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<AdminEventDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> GetAdminEvents(
        [FromQuery] AdminEventsQueryRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var events = await _adminManagementService.GetAdminEventsAsync(request, cancellationToken);
            return Ok(events);
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpDelete("{eventId:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AdminSoftDeleteEvent(Guid eventId, CancellationToken cancellationToken)
    {
        try
        {
            await _adminManagementService.AdminSoftDeleteEventAsync(eventId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpPatch("{eventId:guid}/restore")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(403)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AdminRestoreEvent(Guid eventId, CancellationToken cancellationToken)
    {
        try
        {
            await _adminManagementService.AdminRestoreEventAsync(eventId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }
}
