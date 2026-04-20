using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Client.Contracts.Resources;

public interface IUserResource
{
    Task<UserDto?> GetAsync(GetUserByIdParameters parameters);
    Task<RegisterUserResult> RegisterAsync(RegisterUserParameters parameters);
}
