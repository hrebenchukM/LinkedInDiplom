using Network.Contracts.DTOs;
using Network.Contracts.Parameters.PageAdmin;
using Network.Contracts.Results;

namespace Network.Contracts.Services;

// Интерфейс сервиса администраторов страниц
public interface IPageAdminService
{
    Task<PageAdminResult> AddAdminAsync(AddPageAdminParameters parameters);

    Task<PageAdminResult> RemoveAdminAsync(RemovePageAdminParameters parameters);

    Task<IReadOnlyCollection<PageAdminDto>> GetPageAdminsAsync(GetPageAdminsParameters parameters);
}
