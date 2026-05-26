using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Reaction;

// Запрос на upsert реакции (пользователь из JWT)
public record UpsertReactionRequest
{
    [Required]
    public string ReactionType { get; init; } = default!;
}
