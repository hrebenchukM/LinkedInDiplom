using Facade.NetworkManagement.Contracts.Requests.Contact;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.NetworkManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NetworkManagement.Controllers.Controllers;

public class NetworkContactsController : NetworkManagementControllerBase
{
    public NetworkContactsController(INetworkManagementService networkManagementService)
        : base(networkManagementService)
    {
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

        var response = await NetworkService.SendContactRequestAsync(userId, request);

        if (!response.Success)
            return MapContactError(response);

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

        var contacts = await NetworkService.GetMyContactsAsync(userId);

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

        var contact = await NetworkService.GetMyContactByIdAsync(userId, contactId);

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

        var response = await NetworkService.AcceptContactAsync(userId, contactId);

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

        var response = await NetworkService.RejectContactAsync(userId, contactId);

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

        var response = await NetworkService.DeleteMyContactAsync(userId, contactId);

        if (!response.Success)
            return MapContactError(response);

        return Ok(response);
    }
}
