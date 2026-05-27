using System.Security.Claims;
using Facade.NetworkManagement.Contracts.Requests.BlockedUser;
using Facade.NetworkManagement.Contracts.Requests.Contact;
using Facade.NetworkManagement.Contracts.Requests.Follow;
using Facade.NetworkManagement.Contracts.Requests.Group;
using Facade.NetworkManagement.Contracts.Requests.Page;
using Facade.NetworkManagement.Contracts.Requests.PageAdmin;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NetworkManagement.Controllers.Controllers;

[ApiController]
[Route("api/network")]
public class NetworkController : ControllerBase
{
    private const string ContactNotFoundError = "Contact not found.";
    private const string FollowNotFoundError = "Follow not found.";
    private const string BlockNotFoundError = "Block not found.";
    private const string GroupNotFoundError = "Group not found.";
    private const string GroupMembershipNotFoundError = "Group membership not found.";
    private const string GroupPostNotFoundError = "Group post not found.";
    private const string GroupPostAlreadyExistsError = "Group post already exists.";
    private const string PostNotFoundError = "Post not found.";
    private const string PageNotFoundError = "Page not found.";
    private const string PageAdminNotFoundError = "Page admin not found.";
    private const string PageFollowNotFoundError = "Page follow not found.";

    private readonly INetworkManagementService _networkManagementService;

    public NetworkController(INetworkManagementService networkManagementService)
    {
        _networkManagementService = networkManagementService;
    }

    // POST api/network/me/contacts
    [Authorize]
    [HttpPost("me/contacts")]
    [ProducesResponseType(typeof(ContactResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> SendContactRequest([FromBody] SendContactRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.SendContactRequestAsync(userId, request);

        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    // GET api/network/me/contacts
    [Authorize]
    [HttpGet("me/contacts")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyContacts()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var contacts = await _networkManagementService.GetMyContactsAsync(userId);

        return Ok(contacts);
    }

    // GET api/network/me/contacts/{contactId}
    [Authorize]
    [HttpGet("me/contacts/{contactId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyContactById(Guid contactId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var contact = await _networkManagementService.GetMyContactByIdAsync(userId, contactId);

        if (contact == null)
            return NotFound();

        return Ok(contact);
    }

    // PATCH api/network/me/contacts/{contactId}/accept
    [Authorize]
    [HttpPatch("me/contacts/{contactId:guid}/accept")]
    [ProducesResponseType(typeof(ContactResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AcceptContact(Guid contactId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.AcceptContactAsync(userId, contactId);

        if (!response.Success)
            return MapContactError(response);

        return Ok(response);
    }

    // PATCH api/network/me/contacts/{contactId}/reject
    [Authorize]
    [HttpPatch("me/contacts/{contactId:guid}/reject")]
    [ProducesResponseType(typeof(ContactResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RejectContact(Guid contactId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.RejectContactAsync(userId, contactId);

        if (!response.Success)
            return MapContactError(response);

        return Ok(response);
    }

    // DELETE api/network/me/contacts/{contactId}
    [Authorize]
    [HttpDelete("me/contacts/{contactId:guid}")]
    [ProducesResponseType(typeof(ContactResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteMyContact(Guid contactId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.DeleteMyContactAsync(userId, contactId);

        if (!response.Success)
            return MapContactError(response);

        return Ok(response);
    }

    // POST api/network/me/following
    [Authorize]
    [HttpPost("me/following")]
    [ProducesResponseType(typeof(FollowResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> FollowUser([FromBody] FollowUserRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.FollowUserAsync(userId, request);

        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    // DELETE api/network/me/following/{followingId}
    [Authorize]
    [HttpDelete("me/following/{followingId}")]
    [ProducesResponseType(typeof(FollowResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UnfollowUser(string followingId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.UnfollowUserAsync(userId, followingId);

        if (!response.Success)
        {
            if (response.Errors.Contains(FollowNotFoundError))
                return NotFound(response);

            return BadRequest(response);
        }

        return Ok(response);
    }

    // GET api/network/me/following
    [Authorize]
    [HttpGet("me/following")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyFollowing()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var follows = await _networkManagementService.GetMyFollowingAsync(userId);

        return Ok(follows);
    }

    // GET api/network/me/followers
    [Authorize]
    [HttpGet("me/followers")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyFollowers()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var followers = await _networkManagementService.GetMyFollowersAsync(userId);

        return Ok(followers);
    }

    // POST api/network/me/blocked-users
    [Authorize]
    [HttpPost("me/blocked-users")]
    [ProducesResponseType(typeof(BlockedUserResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> BlockUser([FromBody] BlockUserRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.BlockUserAsync(userId, request);

        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    // DELETE api/network/me/blocked-users/{blockedUserId}
    [Authorize]
    [HttpDelete("me/blocked-users/{blockedUserId}")]
    [ProducesResponseType(typeof(BlockedUserResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UnblockUser(string blockedUserId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.UnblockUserAsync(userId, blockedUserId);

        if (!response.Success)
        {
            if (response.Errors.Contains(BlockNotFoundError))
                return NotFound(response);

            return BadRequest(response);
        }

        return Ok(response);
    }

    // GET api/network/me/blocked-users
    [Authorize]
    [HttpGet("me/blocked-users")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyBlockedUsers()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var blocks = await _networkManagementService.GetMyBlockedUsersAsync(userId);

        return Ok(blocks);
    }

    // POST api/network/me/groups
    [Authorize]
    [HttpPost("me/groups")]
    [ProducesResponseType(typeof(UserGroupResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateUserGroup([FromBody] CreateUserGroupRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.CreateUserGroupAsync(userId, request);

        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    // GET api/network/me/groups
    [Authorize]
    [HttpGet("me/groups")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyUserGroups()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var groups = await _networkManagementService.GetMyUserGroupsAsync(userId);

        return Ok(groups);
    }

    // GET api/network/me/groups/{groupId}
    [Authorize]
    [HttpGet("me/groups/{groupId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyUserGroupById(Guid groupId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var group = await _networkManagementService.GetMyUserGroupByIdAsync(userId, groupId);

        if (group == null)
            return NotFound();

        return Ok(group);
    }

    // PATCH api/network/me/groups/{groupId}
    [Authorize]
    [HttpPatch("me/groups/{groupId:guid}")]
    [ProducesResponseType(typeof(UserGroupResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateUserGroup(
        Guid groupId,
        [FromBody] UpdateUserGroupRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.UpdateUserGroupAsync(userId, groupId, request);

        if (!response.Success)
            return MapUserGroupError(response);

        return Ok(response);
    }

    // DELETE api/network/me/groups/{groupId}
    [Authorize]
    [HttpDelete("me/groups/{groupId:guid}")]
    [ProducesResponseType(typeof(UserGroupResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteUserGroup(Guid groupId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.DeleteUserGroupAsync(userId, groupId);

        if (!response.Success)
            return MapUserGroupError(response);

        return Ok(response);
    }

    // POST api/network/me/groups/{groupId}/join
    [Authorize]
    [HttpPost("me/groups/{groupId:guid}/join")]
    [ProducesResponseType(typeof(GroupMemberResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> JoinGroup(Guid groupId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.JoinGroupAsync(userId, groupId);

        if (!response.Success)
            return MapGroupMemberError(response);

        return Ok(response);
    }

    // DELETE api/network/me/groups/{groupId}/membership
    [Authorize]
    [HttpDelete("me/groups/{groupId:guid}/membership")]
    [ProducesResponseType(typeof(GroupMemberResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> LeaveGroup(Guid groupId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.LeaveGroupAsync(userId, groupId);

        if (!response.Success)
            return MapGroupMemberError(response);

        return Ok(response);
    }

    // GET api/network/me/groups/{groupId}/members
    [Authorize]
    [HttpGet("me/groups/{groupId:guid}/members")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetGroupMembers(Guid groupId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var members = await _networkManagementService.GetGroupMembersAsync(userId, groupId);

        return Ok(members);
    }

    // POST api/network/me/groups/{groupId}/posts/{postId}
    [Authorize]
    [HttpPost("me/groups/{groupId:guid}/posts/{postId:guid}")]
    [ProducesResponseType(typeof(GroupPostResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AttachPostToGroup(Guid groupId, Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.AttachPostToGroupAsync(userId, groupId, postId);

        if (!response.Success)
            return MapGroupPostError(response);

        return Ok(response);
    }

    // DELETE api/network/me/groups/{groupId}/posts/{postId}
    [Authorize]
    [HttpDelete("me/groups/{groupId:guid}/posts/{postId:guid}")]
    [ProducesResponseType(typeof(GroupPostResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DetachPostFromGroup(Guid groupId, Guid postId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.DetachPostFromGroupAsync(userId, groupId, postId);

        if (!response.Success)
            return MapGroupPostError(response);

        return Ok(response);
    }

    // GET api/network/me/groups/{groupId}/posts
    [Authorize]
    [HttpGet("me/groups/{groupId:guid}/posts")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetGroupPosts(Guid groupId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var groupPosts = await _networkManagementService.GetGroupPostsAsync(userId, groupId);

        if (groupPosts == null)
            return NotFound();

        return Ok(groupPosts);
    }

    // POST api/network/me/pages
    [Authorize]
    [HttpPost("me/pages")]
    [ProducesResponseType(typeof(PageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreatePage([FromBody] CreatePageRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.CreatePageAsync(userId, request);

        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    // GET api/network/me/pages
    [Authorize]
    [HttpGet("me/pages")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyPages()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var pages = await _networkManagementService.GetMyPagesAsync(userId);

        return Ok(pages);
    }

    // GET api/network/me/pages/following
    [Authorize]
    [HttpGet("me/pages/following")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyFollowedPages()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var pages = await _networkManagementService.GetMyFollowedPagesAsync(userId);

        return Ok(pages);
    }

    // GET api/network/me/pages/{pageId}
    [Authorize]
    [HttpGet("me/pages/{pageId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyPageById(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var page = await _networkManagementService.GetMyPageByIdAsync(userId, pageId);

        if (page == null)
            return NotFound();

        return Ok(page);
    }

    // PATCH api/network/me/pages/{pageId}
    [Authorize]
    [HttpPatch("me/pages/{pageId:guid}")]
    [ProducesResponseType(typeof(PageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdatePage(
        Guid pageId,
        [FromBody] UpdatePageRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.UpdatePageAsync(userId, pageId, request);

        if (!response.Success)
            return MapPageError(response);

        return Ok(response);
    }

    // DELETE api/network/me/pages/{pageId}
    [Authorize]
    [HttpDelete("me/pages/{pageId:guid}")]
    [ProducesResponseType(typeof(PageResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeletePage(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.DeletePageAsync(userId, pageId);

        if (!response.Success)
            return MapPageError(response);

        return Ok(response);
    }

    // POST api/network/me/pages/{pageId}/admins
    [Authorize]
    [HttpPost("me/pages/{pageId:guid}/admins")]
    [ProducesResponseType(typeof(PageAdminResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AddPageAdmin(
        Guid pageId,
        [FromBody] AddPageAdminRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.AddPageAdminAsync(userId, pageId, request);

        if (!response.Success)
            return MapPageAdminError(response);

        return Ok(response);
    }

    // DELETE api/network/me/pages/{pageId}/admins/{adminUserId}
    [Authorize]
    [HttpDelete("me/pages/{pageId:guid}/admins/{adminUserId}")]
    [ProducesResponseType(typeof(PageAdminResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RemovePageAdmin(Guid pageId, string adminUserId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.RemovePageAdminAsync(userId, pageId, adminUserId);

        if (!response.Success)
            return MapPageAdminError(response);

        return Ok(response);
    }

    // GET api/network/me/pages/{pageId}/admins
    [Authorize]
    [HttpGet("me/pages/{pageId:guid}/admins")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetPageAdmins(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var admins = await _networkManagementService.GetPageAdminsAsync(userId, pageId);

        return Ok(admins);
    }

    // POST api/network/me/pages/{pageId}/follow
    [Authorize]
    [HttpPost("me/pages/{pageId:guid}/follow")]
    [ProducesResponseType(typeof(PageFollowerResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> FollowPage(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.FollowPageAsync(userId, pageId);

        if (!response.Success)
            return MapPageFollowerError(response);

        return Ok(response);
    }

    // DELETE api/network/me/pages/{pageId}/follow
    [Authorize]
    [HttpDelete("me/pages/{pageId:guid}/follow")]
    [ProducesResponseType(typeof(PageFollowerResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UnfollowPage(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _networkManagementService.UnfollowPageAsync(userId, pageId);

        if (!response.Success)
            return MapPageFollowerError(response);

        return Ok(response);
    }

    // GET api/network/me/pages/{pageId}/followers
    [Authorize]
    [HttpGet("me/pages/{pageId:guid}/followers")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetPageFollowers(Guid pageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var followers = await _networkManagementService.GetPageFollowersAsync(userId, pageId);

        return Ok(followers);
    }

    private IActionResult MapContactError(ContactResponse response)
    {
        if (response.Errors.Contains(ContactNotFoundError))
            return NotFound(response);

        return BadRequest(response);
    }

    private IActionResult MapUserGroupError(UserGroupResponse response)
    {
        if (response.Errors.Contains(GroupNotFoundError))
            return NotFound(response);

        return BadRequest(response);
    }

    private IActionResult MapGroupMemberError(GroupMemberResponse response)
    {
        if (response.Errors.Contains(GroupNotFoundError) ||
            response.Errors.Contains(GroupMembershipNotFoundError))
        {
            return NotFound(response);
        }

        return BadRequest(response);
    }

    private IActionResult MapGroupPostError(GroupPostResponse response)
    {
        if (response.Errors.Contains(PostNotFoundError) ||
            response.Errors.Contains(GroupNotFoundError) ||
            response.Errors.Contains(GroupPostNotFoundError))
        {
            return NotFound(response);
        }

        if (response.Errors.Contains(GroupPostAlreadyExistsError))
        {
            return BadRequest(response);
        }

        return BadRequest(response);
    }

    private IActionResult MapPageError(PageResponse response)
    {
        if (response.Errors.Contains(PageNotFoundError))
            return NotFound(response);

        return BadRequest(response);
    }

    private IActionResult MapPageAdminError(PageAdminResponse response)
    {
        if (response.Errors.Contains(PageNotFoundError) ||
            response.Errors.Contains(PageAdminNotFoundError))
        {
            return NotFound(response);
        }

        return BadRequest(response);
    }

    private IActionResult MapPageFollowerError(PageFollowerResponse response)
    {
        if (response.Errors.Contains(PageNotFoundError) ||
            response.Errors.Contains(PageFollowNotFoundError))
        {
            return NotFound(response);
        }

        return BadRequest(response);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
    }
}
