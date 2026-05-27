using Events.Client.Contracts.Resources;
using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventSchedule;
using Events.Contracts.Results;
using Events.Contracts.Services;

namespace Events.Client.Resources;

public class EventScheduleResource(IEventScheduleService scheduleService) : IEventScheduleResource
{
    public Task<EventScheduleResult> CreateAsync(CreateEventScheduleParameters parameters)
    {
        return scheduleService.CreateAsync(parameters);
    }

    public Task<IReadOnlyCollection<EventScheduleDto>> GetByEventIdAsync(GetEventScheduleParameters parameters)
    {
        return scheduleService.GetByEventIdAsync(parameters);
    }

    public Task<EventScheduleResult> UpdateAsync(UpdateEventScheduleParameters parameters)
    {
        return scheduleService.UpdateAsync(parameters);
    }

    public Task<EventScheduleResult> DeleteAsync(DeleteEventScheduleParameters parameters)
    {
        return scheduleService.DeleteAsync(parameters);
    }
}
