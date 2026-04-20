using Identity.Client.Contracts.Resources;
using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;

namespace Identity.Client.Resources;

public class UserResource : IUserResource
{
    private readonly IUserService _userService;

    public UserResource(IUserService userService)
    {
        _userService = userService;
    }

    public Task<UserDto?> GetAsync(GetUserByIdParameters parameters)
        => _userService.GetAsync(parameters);

    public Task<RegisterUserResult> RegisterAsync(RegisterUserParameters parameters)
        => _userService.RegisterAsync(parameters);
}
