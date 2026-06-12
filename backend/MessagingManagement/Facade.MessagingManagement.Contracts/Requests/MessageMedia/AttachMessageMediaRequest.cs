using System.ComponentModel.DataAnnotations;

namespace Facade.MessagingManagement.Contracts.Requests.MessageMedia;

public record AttachMessageMediaRequest
{
    [Required]
    [Url]
    [StringLength(2000, MinimumLength = 1)]
    public string MediaUrl { get; init; } = default!;

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string MediaType { get; init; } = default!;
}
