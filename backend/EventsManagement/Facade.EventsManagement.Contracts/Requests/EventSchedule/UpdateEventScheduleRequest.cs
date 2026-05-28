using System.ComponentModel.DataAnnotations;

namespace Facade.EventsManagement.Contracts.Requests.EventSchedule;

public record UpdateEventScheduleRequest
{
    [StringLength(100)]
    public string? TimeLabel { get; init; }

    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; init; } = default!;

    [StringLength(200)]
    public string? SpeakerName { get; init; }

    [Range(0, int.MaxValue)]
    public int OrderIndex { get; init; }
}
