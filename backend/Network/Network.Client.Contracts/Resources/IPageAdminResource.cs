using Network.Contracts.DTOs;
using Network.Contracts.Parameters.PageAdmin;
using Network.Contracts.Results;

namespace Network.Client.Contracts.Resources;

// Resource для работы с администраторами страниц Network-модуля.
// Внутренняя точка доступа фасада к администраторам страниц.
public interface IPageAdminResource
{
    Task<PageAdminResult> AddAdminAsync(AddPageAdminParameters parameters);

    Task<PageAdminResult> RemoveAdminAsync(RemovePageAdminParameters parameters);

    Task<IReadOnlyCollection<PageAdminDto>> GetPageAdminsAsync(GetPageAdminsParameters parameters);
}
