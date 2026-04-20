using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;
using Identity.DataAccess;
using Identity.DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Identity.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IdentityDbContext _dbContext;

    public UserService(UserManager<ApplicationUser> userManager, IdentityDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    public async Task<UserDto?> GetAsync(GetUserByIdParameters parameters)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == parameters.UserId);

        if (user == null)
            return null;

        return MapToDto(user);
    }

    public async Task<RegisterUserResult> RegisterAsync(RegisterUserParameters parameters)
    {
        var user = new ApplicationUser
        {
            UserName = parameters.UserName,
            Email = parameters.Email,
            FirstName = parameters.FirstName,
            LastName = parameters.LastName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, parameters.Password);

        if (!result.Succeeded)
        {
            return new RegisterUserResult
            {
                Succeeded = false,
                Errors = result.Errors.Select(e => e.Description)
            };
        }

        return new RegisterUserResult
        {
            Succeeded = true,
            User = MapToDto(user)
        };
    }

    private static UserDto MapToDto(ApplicationUser user)
    {
        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
