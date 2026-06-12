using Facade.JobsManagement.Contracts.Responses;
using Facade.JobsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.JobsManagement.Controllers.Controllers;

public class JobsFavoritesController : JobsManagementControllerBase
{
    public JobsFavoritesController(IJobsManagementService jobsManagementService)
        : base(jobsManagementService)
    {
    }

    [Authorize]
    [HttpPost("me/favorites/{vacancyId:guid}")]
    [ProducesResponseType(typeof(UserVacancyFavoriteResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AddFavorite(Guid vacancyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await JobsService.AddFavoriteAsync(userId, vacancyId);
        if (!response.Success)
            return MapFavoriteError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/favorites/{vacancyId:guid}")]
    [ProducesResponseType(typeof(UserVacancyFavoriteResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RemoveFavorite(Guid vacancyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await JobsService.RemoveFavoriteAsync(userId, vacancyId);
        if (!response.Success)
            return MapFavoriteError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/favorites")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyFavorites()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var favorites = await JobsService.GetMyFavoritesAsync(userId);
        return Ok(favorites);
    }
}
