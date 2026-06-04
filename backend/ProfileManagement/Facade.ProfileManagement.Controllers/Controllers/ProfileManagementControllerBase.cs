using System.Security.Claims;
using Facade.ProfileManagement.Contracts.Responses;
using Facade.ProfileManagement.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfileManagement.Controllers.Controllers;

[ApiController]
[Route("api/profile")]
/// <summary>
/// Базовый controller facade-слоя Profile.
/// Держит общий route и helper-методы, чтобы feature-контроллеры не дублировали одинаковую логику.
/// </summary>
public abstract class ProfileManagementControllerBase : ControllerBase
{
    protected const string ProfileNotFoundError = "Profile not found.";

    protected IProfileManagementService ProfileService { get; }

    protected ProfileManagementControllerBase(IProfileManagementService profileManagementService)
    {
        ProfileService = profileManagementService;
    }

    private static readonly HashSet<string> ProfileNotFoundErrors = new(StringComparer.Ordinal)
    {
        ProfileNotFoundError
    };

    private static readonly HashSet<string> MessageSettingsNotFoundErrors = new(StringComparer.Ordinal);

    private static readonly HashSet<string> ProfileViewNotFoundErrors = new(StringComparer.Ordinal)
    {
        ProfileNotFoundError
    };

    protected IActionResult MapProfileError(ProfileResponse response) =>
        MapErrors(response, response.Errors, ProfileNotFoundErrors);

    protected IActionResult MapMessageSettingsError(MessageSettingsResponse response) =>
        MapErrors(response, response.Errors, MessageSettingsNotFoundErrors);

    protected IActionResult MapProfileViewError(ProfileViewResponse response) =>
        MapErrors(response, response.Errors, ProfileViewNotFoundErrors);

    protected string? GetCurrentUserId() =>
        // JWT claim, который используется как идентификатор текущего пользователя.
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    protected IActionResult MapErrors<TResponse>(
        TResponse response,
        IEnumerable<string> errors,
        IReadOnlySet<string> notFoundErrors)
    {
        if (errors.Any(notFoundErrors.Contains))
            return new NotFoundObjectResult(response);

        return new BadRequestObjectResult(response);
    }
}
