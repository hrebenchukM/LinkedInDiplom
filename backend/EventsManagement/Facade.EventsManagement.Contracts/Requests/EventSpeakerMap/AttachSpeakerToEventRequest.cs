using System.ComponentModel.DataAnnotations;

namespace Facade.EventsManagement.Contracts.Requests.EventSpeakerMap;

public record AttachSpeakerToEventRequest
{
    [Required]
    public Guid SpeakerId { get; init; }

    [Range(0, int.MaxValue)]
    public int OrderIndex { get; init; }
}
