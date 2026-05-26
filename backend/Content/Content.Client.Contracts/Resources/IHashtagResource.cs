using Content.Contracts.DTOs;
using Content.Contracts.Parameters.Hashtag;
using Content.Contracts.Results;

namespace Content.Client.Contracts.Resources;

// Resource для работы с хэштегами Content-модуля.
// Внутренняя точка доступа фасада к хэштегам.
public interface IHashtagResource
{
    Task<HashtagResult> CreateAsync(CreateHashtagParameters parameters);

    Task<HashtagDto?> GetByIdAsync(GetHashtagByIdParameters parameters);

    Task<HashtagDto?> GetByNameAsync(GetHashtagByNameParameters parameters);
}
