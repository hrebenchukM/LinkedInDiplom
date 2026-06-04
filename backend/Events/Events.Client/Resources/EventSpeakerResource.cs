using Events.Client.Contracts.Resources;
using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventSpeaker;
using Events.Contracts.Results;
using Events.Contracts.Services;

namespace Events.Client.Resources;

public class EventSpeakerResource(IEventSpeakerService speakerService) : IEventSpeakerResource
{
    public Task<EventSpeakerResult> CreateAsync(CreateEventSpeakerParameters parameters)
    {
        return speakerService.CreateAsync(parameters);
    }

    public Task<EventSpeakerDto?> GetByIdAsync(GetEventSpeakerByIdParameters parameters)
    {
        return speakerService.GetByIdAsync(parameters);
    }

    public Task<EventSpeakerResult> UpdateAsync(UpdateEventSpeakerParameters parameters)
    {
        return speakerService.UpdateAsync(parameters);
    }

    public Task<EventSpeakerResult> DeleteAsync(DeleteEventSpeakerParameters parameters)
    {
        return speakerService.DeleteAsync(parameters);
    }
}
