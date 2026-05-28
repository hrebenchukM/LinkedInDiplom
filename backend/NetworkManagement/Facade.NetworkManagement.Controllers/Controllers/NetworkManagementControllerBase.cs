using System.Security.Claims;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NetworkManagement.Controllers.Controllers;

[ApiController]
[Route("api/network")]
public abstract class NetworkManagementControllerBase : ControllerBase
{
    protected const string ContactNotFoundError = "Contact not found.";
    protected const string FollowNotFoundError = "Follow not found.";
    protected const string BlockNotFoundError = "Block not found.";
    protected const string GroupNotFoundError = "Group not found.";
    protected const string GroupMembershipNotFoundError = "Group membership not found.";
    protected const string GroupPostNotFoundError = "Group post not found.";
    protected const string PostNotFoundError = "Post not found.";
    protected const string PageNotFoundError = "Page not found.";
    protected const string PageAdminNotFoundError = "Page admin not found.";
    protected const string PageFollowNotFoundError = "Page follow not found.";

    protected INetworkManagementService NetworkService { get; }

    protected NetworkManagementControllerBase(INetworkManagementService networkManagementService)
    {
        NetworkService = networkManagementService;
    }

    private static readonly HashSet<string> ContactNotFoundErrors = new(StringComparer.Ordinal)
    {
        ContactNotFoundError
    };

    private static readonly HashSet<string> FollowNotFoundErrors = new(StringComparer.Ordinal)
    {
        FollowNotFoundError
    };

    private static readonly HashSet<string> BlockNotFoundErrors = new(StringComparer.Ordinal)
    {
        BlockNotFoundError
    };

    private static readonly HashSet<string> GroupNotFoundErrors = new(StringComparer.Ordinal)
    {
        GroupNotFoundError
    };

    private static readonly HashSet<string> GroupMemberNotFoundErrors = new(StringComparer.Ordinal)
    {
        GroupNotFoundError,
        GroupMembershipNotFoundError
    };

    private static readonly HashSet<string> GroupPostNotFoundErrors = new(StringComparer.Ordinal)
    {
        PostNotFoundError,
        GroupNotFoundError,
        GroupPostNotFoundError
    };

    private static readonly HashSet<string> PageNotFoundErrors = new(StringComparer.Ordinal)
    {
        PageNotFoundError
    };

    private static readonly HashSet<string> PageAdminNotFoundErrors = new(StringComparer.Ordinal)
    {
        PageNotFoundError,
        PageAdminNotFoundError
    };

    private static readonly HashSet<string> PageFollowerNotFoundErrors = new(StringComparer.Ordinal)
    {
        PageNotFoundError,
        PageFollowNotFoundError
    };

    protected IActionResult MapContactError(ContactResponse response) =>
        MapErrors(response, response.Errors, ContactNotFoundErrors);

    protected IActionResult MapFollowError(FollowResponse response) =>
        MapErrors(response, response.Errors, FollowNotFoundErrors);

    protected IActionResult MapBlockedUserError(BlockedUserResponse response) =>
        MapErrors(response, response.Errors, BlockNotFoundErrors);

    protected IActionResult MapUserGroupError(UserGroupResponse response) =>
        MapErrors(response, response.Errors, GroupNotFoundErrors);

    protected IActionResult MapGroupMemberError(GroupMemberResponse response) =>
        MapErrors(response, response.Errors, GroupMemberNotFoundErrors);

    protected IActionResult MapGroupPostError(GroupPostResponse response) =>
        MapErrors(response, response.Errors, GroupPostNotFoundErrors);

    protected IActionResult MapPageError(PageResponse response) =>
        MapErrors(response, response.Errors, PageNotFoundErrors);

    protected IActionResult MapPageAdminError(PageAdminResponse response) =>
        MapErrors(response, response.Errors, PageAdminNotFoundErrors);

    protected IActionResult MapPageFollowerError(PageFollowerResponse response) =>
        MapErrors(response, response.Errors, PageFollowerNotFoundErrors);

    protected string? GetCurrentUserId() =>
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
