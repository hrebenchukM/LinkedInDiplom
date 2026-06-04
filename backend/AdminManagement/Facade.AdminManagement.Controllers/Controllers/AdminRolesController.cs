using Facade.AdminManagement.Contracts.Services;
using Identity.Contracts.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.AdminManagement.Controllers.Controllers;

[ApiController]
[Route("api/admin/roles")]
[Authorize(Roles = IdentityRoleNames.Admin)]
public class AdminRolesController : ControllerBase
{
    private readonly IAdminManagementService _adminManagementService;

    public AdminRolesController(IAdminManagementService adminManagementService)
    {
        _adminManagementService = adminManagementService;
    }

    [HttpGet]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetRoles(CancellationToken cancellationToken)
    {
        var roles = await _adminManagementService.GetRolesAsync(cancellationToken);
        return Ok(roles);
    }
}
