using System.ComponentModel.DataAnnotations;

namespace Facade.MessagingManagement.Contracts.Requests.Message;

public record SendMessageRequest
{
    [Required]
    [StringLength(4000, MinimumLength = 1)]
    public string Content { get; init; } = default!;
}
