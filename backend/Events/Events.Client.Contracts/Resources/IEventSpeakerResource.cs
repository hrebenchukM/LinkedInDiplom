using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventSpeaker;
using Events.Contracts.Results;

namespace Events.Client.Contracts.Resources;

public interface IEventSpeakerResource
{
    Task<EventSpeakerResult> CreateAsync(CreateEventSpeakerParameters parameters);
    Task<EventSpeakerDto?> GetByIdAsync(GetEventSpeakerByIdParameters parameters);
    Task<EventSpeakerResult> UpdateAsync(UpdateEventSpeakerParameters parameters);
    Task<EventSpeakerResult> DeleteAsync(DeleteEventSpeakerParameters parameters);
}
