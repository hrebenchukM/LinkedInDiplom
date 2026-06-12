using System.ComponentModel.DataAnnotations;

namespace Facade.ContentManagement.Contracts.Requests.Mention;

// Запрос на добавление упоминания (автор из JWT)
public record AddMentionRequest
{
    [Required]
    public string MentionedUserId { get; init; } = default!;
}
