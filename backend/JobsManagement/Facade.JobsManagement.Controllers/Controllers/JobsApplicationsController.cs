using Facade.JobsManagement.Contracts.Responses;
using Facade.JobsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.JobsManagement.Controllers.Controllers;

public class JobsApplicationsController : JobsManagementControllerBase
{
    public JobsApplicationsController(IJobsManagementService jobsManagementService)
        : base(jobsManagementService)
    {
    }

    [Authorize]
    [HttpPost("me/vacancies/{vacancyId:guid}/apply")]
    [ProducesResponseType(typeof(JobApplicationResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ApplyToVacancy(Guid vacancyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await JobsService.ApplyToVacancyAsync(userId, vacancyId);
        if (!response.Success)
            return MapApplicationError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/applications/{applicationId:guid}")]
    [ProducesResponseType(typeof(JobApplicationResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> WithdrawApplication(Guid applicationId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await JobsService.WithdrawApplicationAsync(userId, applicationId);
        if (!response.Success)
            return MapApplicationError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/applications")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyApplications()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var applications = await JobsService.GetMyApplicationsAsync(userId);
        return Ok(applications);
    }

    [Authorize]
    [HttpGet("me/vacancies/{vacancyId:guid}/applications")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetVacancyApplications(Guid vacancyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var applications = await JobsService.GetVacancyApplicationsAsync(userId, vacancyId);
        if (applications is null)
            return NotFound();

        return Ok(applications);
    }
}
