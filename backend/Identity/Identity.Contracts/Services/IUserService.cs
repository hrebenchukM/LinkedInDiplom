using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Contracts.Services;

public interface IUserService
{
    Task<UserDto?> GetAsync(GetUserByIdParameters parameters);
    Task<RegisterUserResult> RegisterAsync(RegisterUserParameters parameters);
}
