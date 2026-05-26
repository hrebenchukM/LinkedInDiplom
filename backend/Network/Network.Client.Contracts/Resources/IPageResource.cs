using Network.Contracts.DTOs;
using Network.Contracts.Parameters.Page;
using Network.Contracts.Results;

namespace Network.Client.Contracts.Resources;

// Resource для работы со страницами Network-модуля.
// Внутренняя точка доступа фасада к страницам.
public interface IPageResource
{
    Task<PageResult> CreateAsync(CreatePageParameters parameters);

    Task<IReadOnlyCollection<PageDto>> GetMyPagesAsync(GetMyPagesParameters parameters);

    Task<PageDto?> GetByIdAsync(GetPageByIdParameters parameters);

    Task<PageResult> UpdateAsync(UpdatePageParameters parameters);

    Task<PageResult> DeleteAsync(DeletePageParameters parameters);
}
