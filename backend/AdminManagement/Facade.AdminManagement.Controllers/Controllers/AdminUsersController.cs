using System.Security.Claims;
using Facade.AdminManagement.Contracts.Requests;
using Facade.AdminManagement.Contracts.Services;
using Facade.Shared.Contracts.Pagination;
using Identity.Contracts.Constants;
using Identity.Contracts.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.AdminManagement.Controllers.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = IdentityRoleNames.Admin)]
public class AdminUsersController : AdminControllerBase
{
    private readonly IAdminManagementService _adminManagementService;

    public AdminUsersController(IAdminManagementService adminManagementService)
    {
        _adminManagementService = adminManagementService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<AdminUserDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] AdminUsersQueryRequest request,
        CancellationToken cancellationToken)
    {
        var users = await _adminManagementService.GetUsersAsync(request, cancellationToken);
        return Ok(users);
    }

    [HttpGet("{userId}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetUserById(string userId, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _adminManagementService.GetUserByIdAsync(userId, cancellationToken);
            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpGet("{userId}/roles")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetUserRoles(string userId, CancellationToken cancellationToken)
    {
        try
        {
            var roles = await _adminManagementService.GetUserRolesAsync(userId, cancellationToken);
            return Ok(roles);
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpPost("{userId}/roles")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> AddUserToRole(
        string userId,
        [FromBody] AssignUserRoleRequest request,
        CancellationToken cancellationToken)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.RoleName))
        {
            return BadRequestError("RoleName is required.");
        }

        try
        {
            await _adminManagementService.AddUserToRoleAsync(
                userId,
                request.RoleName,
                cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpDelete("{userId}/roles/{roleName}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> RemoveUserFromRole(
        string userId,
        string roleName,
        CancellationToken cancellationToken)
    {
        var currentUserId = GetCurrentUserId();
        if (string.Equals(currentUserId, userId, StringComparison.Ordinal)
            && string.Equals(roleName, IdentityRoleNames.Admin, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequestError("Admin cannot remove own Admin role.");
        }

        try
        {
            await _adminManagementService.RemoveUserFromRoleAsync(userId, roleName, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpPatch("{userId}/lock")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> LockUser(
        string userId,
        [FromBody] LockUserRequest request,
        CancellationToken cancellationToken)
    {
        var currentUserId = GetCurrentUserId();
        if (string.Equals(currentUserId, userId, StringComparison.Ordinal))
        {
            return BadRequestError("Admin cannot lock own account.");
        }

        try
        {
            await _adminManagementService.LockUserAsync(userId, request?.LockoutEnd, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpPatch("{userId}/unlock")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UnlockUser(string userId, CancellationToken cancellationToken)
    {
        try
        {
            await _adminManagementService.UnlockUserAsync(userId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpPatch("{userId}/restore")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> RestoreUser(string userId, CancellationToken cancellationToken)
    {
        try
        {
            await _adminManagementService.RestoreUserAsync(userId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpDelete("{userId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> SoftDeleteUser(string userId, CancellationToken cancellationToken)
    {
        var currentUserId = GetCurrentUserId();
        if (string.Equals(currentUserId, userId, StringComparison.Ordinal))
        {
            return BadRequestError("Admin cannot delete own account.");
        }

        try
        {
            await _adminManagementService.SoftDeleteUserAsync(userId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    private string? GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");
}
