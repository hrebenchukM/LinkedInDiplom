using Identity.Client.Contracts.Resources;
using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;

namespace Identity.Client.Resources;

// Обёртка над IUserService
public class UserResource : IUserResource
{
    // Настоящая бизнес-логика пользователей
    private readonly IUserService _userService;
    private readonly IUserAdminService _userAdminService;
    private readonly IRoleService _roleService;

    // Получаем IUserService через DI
    public UserResource(
        IUserService userService,
        IUserAdminService userAdminService,
        IRoleService roleService)
    {
        _userService = userService;
        _userAdminService = userAdminService;
        _roleService = roleService;
    }

    // Просто передаём вызов в сервис
    // прослойка, чтобы  проект был готов к микросервисам. Сейчас он просто вызывает сервис напрямую, а в будущем его можно заменить на HTTP-клиент.
    public Task<UserDto?> GetAsync(GetUserByIdParameters parameters)
        => _userService.GetAsync(parameters);

    // Просто передаём регистрацию в сервис
    public Task<RegisterUserResult> RegisterAsync(RegisterUserParameters parameters)
        => _userService.RegisterAsync(parameters);

    public Task<AdminUserListResult> GetUsersAsync(
        GetUsersParameters parameters,
        CancellationToken cancellationToken = default)
        => _userAdminService.GetUsersAsync(parameters, cancellationToken);

    public Task<AdminUserDto> GetUserByIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userAdminService.GetUserByIdAsync(userId, cancellationToken);

    public Task LockUserAsync(
        string userId,
        DateTimeOffset? lockoutEnd = null,
        CancellationToken cancellationToken = default)
        => _userAdminService.LockUserAsync(userId, lockoutEnd, cancellationToken);

    public Task UnlockUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userAdminService.UnlockUserAsync(userId, cancellationToken);

    public Task SoftDeleteUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userAdminService.SoftDeleteUserAsync(userId, cancellationToken);

    public Task RestoreUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userAdminService.RestoreUserAsync(userId, cancellationToken);

    public Task<IReadOnlyCollection<RoleDto>> GetRolesAsync(
        CancellationToken cancellationToken = default)
        => _roleService.GetRolesAsync(cancellationToken);

    public Task<IReadOnlyCollection<string>> GetUserRolesAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _roleService.GetUserRolesAsync(userId, cancellationToken);

    public Task AddUserToRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default)
        => _roleService.AddUserToRoleAsync(userId, roleName, cancellationToken);

    public Task RemoveUserFromRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default)
        => _roleService.RemoveUserFromRoleAsync(userId, roleName, cancellationToken);

    public Task<IdentityStatsDto> GetIdentityStatsAsync(
        CancellationToken cancellationToken = default)
        => _userAdminService.GetIdentityStatsAsync(cancellationToken);
}