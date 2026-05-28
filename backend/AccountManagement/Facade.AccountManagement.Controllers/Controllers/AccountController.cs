using Facade.AccountManagement.Contracts.Requests;
using Facade.AccountManagement.Contracts.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Facade.AccountManagement.Contracts.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace Facade.AccountManagement.Controllers.Controllers;

[ApiController]
[Route("api/auth")]
public class AccountController : ControllerBase
{
    private readonly IAccountManagementService _accountManagementService;

    public AccountController(IAccountManagementService accountManagementService)
    {
        _accountManagementService = accountManagementService;
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(Facade.AccountManagement.Contracts.Responses.RegisterResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _accountManagementService.RegisterAsync(request);

        if (!response.Success)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(Facade.AccountManagement.Contracts.Responses.LoginResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _accountManagementService.LoginAsync(request);

        if (!response.Success)
        {
            return Unauthorized(response);
        }

        return Ok(response);
    }

    [HttpPost("google")]
    [ProducesResponseType(typeof(Facade.AccountManagement.Contracts.Responses.ExternalLoginResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GoogleLogin([FromBody] ExternalLoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        request.Provider = "Google";
        var response = await _accountManagementService.ExternalLoginAsync(request);

        if (!response.Success)
        {
            return Unauthorized(response);
        }

        return Ok(response);
    }

    [HttpPost("facebook")]
    [ProducesResponseType(typeof(Facade.AccountManagement.Contracts.Responses.ExternalLoginResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> FacebookLogin([FromBody] ExternalLoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        request.Provider = "Facebook";
        var response = await _accountManagementService.ExternalLoginAsync(request);

        if (!response.Success)
        {
            return Unauthorized(response);
        }

        return Ok(response);
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(Facade.AccountManagement.Contracts.Responses.RefreshTokenResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _accountManagementService.RefreshTokenAsync(request);

        if (!response.Success)
        {
            return Unauthorized(response);
        }

        return Ok(response);
    }

    [HttpPost("logout")]
    [ProducesResponseType(typeof(Facade.AccountManagement.Contracts.Responses.LogoutResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _accountManagementService.LogoutAsync(request.RefreshToken);

        if (!response.Success)
        {
            return Unauthorized(response);
        }

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(AccountDto), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var item = await _accountManagementService.GetCurrentAccountAsync(userId);

        if (item == null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}