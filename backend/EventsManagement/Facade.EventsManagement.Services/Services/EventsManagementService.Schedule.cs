using Events.Contracts.Parameters.EventSchedule;
using Facade.EventsManagement.Contracts.DTOs;
using Facade.EventsManagement.Contracts.Requests.EventSchedule;
using Facade.EventsManagement.Contracts.Responses;

namespace Facade.EventsManagement.Services.Services;

public partial class EventsManagementService
{
    public async Task<EventScheduleResponse> CreateScheduleItemAsync(string userId, Guid eventId, CreateEventScheduleRequest request)
    {
        var result = await _eventsClient.Schedule.CreateAsync(new CreateEventScheduleParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            TimeLabel = request.TimeLabel,
            Title = request.Title,
            SpeakerName = request.SpeakerName,
            OrderIndex = request.OrderIndex
        });

        return MapEventScheduleResultToFacadeResponse(result);
    }

    public async Task<IReadOnlyCollection<EventScheduleDto>> GetEventScheduleAsync(Guid eventId)
    {
        var schedule = await _eventsClient.Schedule.GetByEventIdAsync(new GetEventScheduleParameters
        {
            CurrentUserId = string.Empty,
            EventId = eventId
        });

        return schedule.Select(MapEventScheduleToFacadeDto).ToList();
    }

    public async Task<EventScheduleResponse> UpdateScheduleItemAsync(string userId, Guid eventId, Guid scheduleId, UpdateEventScheduleRequest request)
    {
        var result = await _eventsClient.Schedule.UpdateAsync(new UpdateEventScheduleParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            ScheduleId = scheduleId,
            TimeLabel = request.TimeLabel,
            Title = request.Title,
            SpeakerName = request.SpeakerName,
            OrderIndex = request.OrderIndex
        });

        return MapEventScheduleResultToFacadeResponse(result);
    }

    public async Task<EventScheduleResponse> DeleteScheduleItemAsync(string userId, Guid eventId, Guid scheduleId)
    {
        var result = await _eventsClient.Schedule.DeleteAsync(new DeleteEventScheduleParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            ScheduleId = scheduleId
        });

        return MapEventScheduleResultToFacadeResponse(result);
    }
}
