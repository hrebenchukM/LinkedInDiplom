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
    // Сервис фасада, который работает через IdentityClient
    private readonly IAccountManagementService _accountManagementService;

    // Получаем сервис через DI
    public AccountController(IAccountManagementService accountManagementService)
    {
        _accountManagementService = accountManagementService;
    }

    // POST api/auth/register
    [HttpPost("register")]
    [ProducesResponseType(typeof(Facade.AccountManagement.Contracts.Responses.RegisterResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Проверяем validation attributes: Required, EmailAddress, MinLength
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Передаём регистрацию в фасадный сервис
        var response = await _accountManagementService.RegisterAsync(request);

        // Если регистрация не удалась — 400
        if (!response.Success)
        {
            return BadRequest(response);
        }

        // Если всё хорошо — 200
        return Ok(response);
    }

    // POST api/auth/login
    [HttpPost("login")]
    [ProducesResponseType(typeof(Facade.AccountManagement.Contracts.Responses.LoginResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Проверяем модель запроса
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Передаём логин в фасадный сервис
        var response = await _accountManagementService.LoginAsync(request);

        // Если логин неуспешный — 401
        if (!response.Success)
        {
            return Unauthorized(response);
        }

        // Если всё хорошо — 200
        return Ok(response);
    }

    // POST api/auth/refresh
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(Facade.AccountManagement.Contracts.Responses.RefreshTokenResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        // Проверяем модель запроса
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Обновляем access token по refresh token
        var response = await _accountManagementService.RefreshTokenAsync(request);

        // Если refresh token плохой — 401
        if (!response.Success)
        {
            return Unauthorized(response);
        }

        // Если всё хорошо — 200
        return Ok(response);
    }

    // POST api/auth/logout
    [HttpPost("logout")]
    [ProducesResponseType(typeof(Facade.AccountManagement.Contracts.Responses.LogoutResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
    {
        // Проверяем модель запроса
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Logout = отзыв refresh token
        var response = await _accountManagementService.LogoutAsync(request.RefreshToken);

        return Ok(response);
    }

    // GET api/auth/me
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(AccountDto), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Me()
    {
        // Достаём userId из JWT token
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        // Получаем текущий аккаунт
        var account = await _accountManagementService.GetCurrentAccountAsync(userId);

        if (account == null)
        {
            return NotFound();
        }

        return Ok(account);
    }
}