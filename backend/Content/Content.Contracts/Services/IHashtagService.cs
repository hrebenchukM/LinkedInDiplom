using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Hashtag;
using Content.Contracts.Results;

namespace Content.Contracts.Services;

// Интерфейс сервиса хэштегов
public interface IHashtagService
{
    Task<HashtagResult> CreateAsync(CreateHashtagParameters parameters);

    Task<HashtagDto?> GetByIdAsync(GetHashtagByIdParameters parameters);

    Task<HashtagDto?> GetByNameAsync(GetHashtagByNameParameters parameters);
}
