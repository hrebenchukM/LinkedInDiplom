using System.ComponentModel.DataAnnotations;

namespace Facade.EventsManagement.Contracts.Requests.Event;

public record CreateEventRequest
{
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string OrganizerType { get; init; } = default!;

    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; init; } = default!;

    [StringLength(4000)]
    public string? Description { get; init; }

    [Url]
    [StringLength(2000)]
    public string? CoverImageUrl { get; init; }

    [StringLength(300)]
    public string? Location { get; init; }

    public bool IsOnline { get; init; }

    [Url]
    [StringLength(2000)]
    public string? ExternalLink { get; init; }

    [StringLength(100)]
    public string? Timezone { get; init; }

    [StringLength(50)]
    public string? Visibility { get; init; }

    public bool? AllowComments { get; init; }
    public DateTime StartAt { get; init; }
    public DateTime? EndAt { get; init; }
}
