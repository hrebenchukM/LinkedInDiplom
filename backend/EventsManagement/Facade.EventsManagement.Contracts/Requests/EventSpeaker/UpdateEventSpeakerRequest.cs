using System.ComponentModel.DataAnnotations;

namespace Facade.EventsManagement.Contracts.Requests.EventSpeaker;

public record UpdateEventSpeakerRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; init; } = default!;

    [StringLength(200)]
    public string? Title { get; init; }

    [Url]
    [StringLength(2000)]
    public string? AvatarUrl { get; init; }
}
