using Events.Contracts.DTOs;
using Events.Contracts.Parameters.Event;
using Events.Contracts.Results;

namespace Events.Client.Contracts.Resources;

public interface IEventResource
{
    Task<EventResult> CreateAsync(CreateEventParameters parameters);
    Task<IReadOnlyCollection<EventDto>> GetMyEventsAsync(GetMyEventsParameters parameters);
    Task<EventDto?> GetByIdAsync(GetEventByIdParameters parameters);
    Task<EventResult> UpdateAsync(UpdateEventParameters parameters);
    Task<EventResult> DeleteAsync(DeleteEventParameters parameters);
}
