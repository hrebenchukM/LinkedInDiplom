using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventSchedule;
using Events.Contracts.Results;

namespace Events.Client.Contracts.Resources;

public interface IEventScheduleResource
{
    Task<EventScheduleResult> CreateAsync(CreateEventScheduleParameters parameters);
    Task<IReadOnlyCollection<EventScheduleDto>> GetByEventIdAsync(GetEventScheduleParameters parameters);
    Task<EventScheduleResult> UpdateAsync(UpdateEventScheduleParameters parameters);
    Task<EventScheduleResult> DeleteAsync(DeleteEventScheduleParameters parameters);
}
