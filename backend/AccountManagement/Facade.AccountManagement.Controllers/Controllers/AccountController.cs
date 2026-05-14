using Facade.AccountManagement.Contracts.Requests;
using Facade.AccountManagement.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

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

    /// <summary>
    /// Register a new user account
    /// </summary>
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

    /// <summary>
    /// Login with email and password
    /// </summary>
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

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
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

    /// <summary>
    /// Logout by revoking refresh token
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(typeof(Facade.AccountManagement.Contracts.Responses.LogoutResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _accountManagementService.LogoutAsync(request.RefreshToken);

        return Ok(response);
    }
}
