using Facade.AdminManagement.Contracts.DTOs;
using Facade.AdminManagement.Contracts.Services;
using Identity.Contracts.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.AdminManagement.Controllers.Controllers;

[ApiController]
[Route("api/admin/stats")]
[Authorize(Roles = IdentityRoleNames.Admin)]
public class AdminStatsController : AdminControllerBase
{
    private readonly IAdminManagementService _adminManagementService;

    public AdminStatsController(IAdminManagementService adminManagementService)
    {
        _adminManagementService = adminManagementService;
    }

    [HttpGet("overview")]
    [ProducesResponseType(typeof(AdminStatsOverviewDto), 200)]
    public async Task<IActionResult> GetStatsOverview(CancellationToken cancellationToken)
    {
        var overview = await _adminManagementService.GetStatsOverviewAsync(cancellationToken);
        return Ok(overview);
    }
}
