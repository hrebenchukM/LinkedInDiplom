using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Client.Contracts.Resources;

// Ресурс для работы с пользователями
public interface IUserResource
{
    // Получить пользователя по Id
    Task<UserDto?> GetAsync(GetUserByIdParameters parameters);

    // Зарегистрировать пользователя
    Task<RegisterUserResult> RegisterAsync(RegisterUserParameters parameters);

    Task<AdminUserListResult> GetUsersAsync(
        GetUsersParameters parameters,
        CancellationToken cancellationToken = default);

    Task<AdminUserDto> GetUserByIdAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task LockUserAsync(
        string userId,
        DateTimeOffset? lockoutEnd = null,
        CancellationToken cancellationToken = default);

    Task UnlockUserAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task SoftDeleteUserAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<RoleDto>> GetRolesAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<string>> GetUserRolesAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task AddUserToRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default);

    Task RemoveUserFromRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default);

    Task<IdentityStatsDto> GetIdentityStatsAsync(
        CancellationToken cancellationToken = default);
}


//Чтобы Facade/IdentityClient не зависели от конкретного класса напрямую.
//Они знают только интерфейс:IUserResource
//А кто именно внутри будет выполнять работу — не важно.


//А потом, если Identity вынесешь в микросервис, можно сделать:HttpUserResource
//И он будет не напрямую сервис вызывать, а отправлять HTTP-запросы.