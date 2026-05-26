using Network.Contracts.DTOs;
using Network.Contracts.Parameters.Page;
using Network.Contracts.Results;

namespace Network.Contracts.Services;

// Интерфейс сервиса страниц
public interface IPageService
{
    Task<PageResult> CreateAsync(CreatePageParameters parameters);

    Task<IReadOnlyCollection<PageDto>> GetMyPagesAsync(GetMyPagesParameters parameters);

    Task<PageDto?> GetByIdAsync(GetPageByIdParameters parameters);

    Task<PageResult> UpdateAsync(UpdatePageParameters parameters);

    Task<PageResult> DeleteAsync(DeletePageParameters parameters);
}
