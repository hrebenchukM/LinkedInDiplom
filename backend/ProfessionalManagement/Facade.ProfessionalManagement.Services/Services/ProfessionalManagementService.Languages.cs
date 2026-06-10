using Facade.ProfessionalManagement.Contracts.DTOs;
using Facade.ProfessionalManagement.Contracts.Requests.Language;
using Facade.ProfessionalManagement.Contracts.Requests.UserLanguage;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.Shared.Contracts.Pagination;
using Professional.Contracts.Parameters.Language;
using Professional.Contracts.Parameters.UserLanguage;

namespace Facade.ProfessionalManagement.Services.Services;

public partial class ProfessionalManagementService
{
    // Получить язык в справочнике по Id
    public async Task<LanguageDto?> GetLanguageByIdAsync(Guid languageId)
    {
        var language = await _professionalClient.Languages.GetByIdAsync(
            new GetLanguageByIdParameters
            {
                LanguageId = languageId
            });

        return language == null ? null : MapLanguageToFacadeDto(language);
    }

    // Получить список языков в справочнике
    public async Task<PagedResponse<LanguageDto>> GetLanguagesAsync(
        GetLanguagesQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _professionalClient.Languages.GetLanguagesAsync(
            new GetLanguagesParameters
            {
                Skip = skip,
                Take = pageSize,
                Search = request.Search,
                SortBy = request.SortBy,
                SortDirection = request.SortDirection
            },
            cancellationToken);

        var items = result.Items
            .Select(MapLanguageToFacadeDto)
            .ToList();

        return Pagination.Create(items, page, pageSize, result.TotalCount);
    }

    // Создать язык в справочнике
    public async Task<LanguageResponse> CreateLanguageAsync(CreateLanguageRequest request)
    {
        var result = await _professionalClient.Languages.CreateAsync(
            new CreateLanguageParameters
            {
                Name = request.Name
            });

        return new LanguageResponse
        {
            Success = result.Succeeded,
            Language = result.Language == null ? null : MapLanguageToFacadeDto(result.Language),
            Errors = result.Errors
        };
    }

    // Получить все мои языки
    public async Task<IReadOnlyCollection<UserLanguageDto>> GetMyUserLanguagesAsync(string userId)
    {
        var userLanguages = await _professionalClient.UserLanguages.GetUserLanguagesAsync(
            new GetUserLanguagesParameters
            {
                UserId = userId
            });

        return userLanguages
            .Select(MapUserLanguageToFacadeDto)
            .ToList();
    }

    // Получить один мой язык по Id
    public async Task<UserLanguageDto?> GetMyUserLanguageByIdAsync(string userId, Guid userLanguageId)
    {
        var userLanguage = await _professionalClient.UserLanguages.GetByIdAsync(
            new GetUserLanguageByIdParameters
            {
                UserId = userId,
                UserLanguageId = userLanguageId
            });

        return userLanguage == null ? null : MapUserLanguageToFacadeDto(userLanguage);
    }

    // Добавить язык текущему пользователю
    public async Task<UserLanguageResponse> CreateMyUserLanguageAsync(
        string userId,
        CreateUserLanguageRequest request)
    {
        var result = await _professionalClient.UserLanguages.CreateAsync(
            new CreateUserLanguageParameters
            {
                UserId = userId,
                LanguageId = request.LanguageId,
                Level = request.Level
            });

        return new UserLanguageResponse
        {
            Success = result.Succeeded,
            UserLanguage = result.UserLanguage == null ? null : MapUserLanguageToFacadeDto(result.UserLanguage),
            Errors = result.Errors
        };
    }

    // Полностью обновить язык пользователя
    public async Task<UserLanguageResponse> UpdateMyUserLanguageAsync(
        string userId,
        Guid userLanguageId,
        UpdateUserLanguageRequest request)
    {
        var result = await _professionalClient.UserLanguages.UpdateAsync(
            new UpdateUserLanguageParameters
            {
                UserId = userId,
                UserLanguageId = userLanguageId,
                LanguageId = request.LanguageId,
                Level = request.Level
            });

        return new UserLanguageResponse
        {
            Success = result.Succeeded,
            UserLanguage = result.UserLanguage == null ? null : MapUserLanguageToFacadeDto(result.UserLanguage),
            Errors = result.Errors
        };
    }

    // Частично обновить язык пользователя
    public async Task<UserLanguageResponse> PatchMyUserLanguageAsync(
        string userId,
        Guid userLanguageId,
        PatchUserLanguageRequest request)
    {
        var result = await _professionalClient.UserLanguages.PatchAsync(
            new PatchUserLanguageParameters
            {
                UserId = userId,
                UserLanguageId = userLanguageId,
                LanguageId = request.LanguageId,
                Level = request.Level
            });

        return new UserLanguageResponse
        {
            Success = result.Succeeded,
            UserLanguage = result.UserLanguage == null ? null : MapUserLanguageToFacadeDto(result.UserLanguage),
            Errors = result.Errors
        };
    }

    // Удалить язык пользователя
    public async Task<UserLanguageResponse> DeleteMyUserLanguageAsync(
        string userId,
        Guid userLanguageId)
    {
        var result = await _professionalClient.UserLanguages.DeleteAsync(
            new DeleteUserLanguageParameters
            {
                UserId = userId,
                UserLanguageId = userLanguageId
            });

        return new UserLanguageResponse
        {
            Success = result.Succeeded,
            UserLanguage = result.UserLanguage == null ? null : MapUserLanguageToFacadeDto(result.UserLanguage),
            Errors = result.Errors
        };
    }

    private static LanguageDto MapLanguageToFacadeDto(Professional.Contracts.DTOs.LanguageDto language)
    {
        return new LanguageDto
        {
            Id = language.Id,
            Name = language.Name,
            CreatedAt = language.CreatedAt
        };
    }

    private static UserLanguageDto MapUserLanguageToFacadeDto(Professional.Contracts.DTOs.UserLanguageDto userLanguage)
    {
        return new UserLanguageDto
        {
            Id = userLanguage.Id,
            UserId = userLanguage.UserId,
            LanguageId = userLanguage.LanguageId,
            Level = userLanguage.Level,
            CreatedAt = userLanguage.CreatedAt,
            UpdatedAt = userLanguage.UpdatedAt
        };
    }
}
