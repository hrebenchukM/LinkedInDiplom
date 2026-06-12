using Events.Client.Contracts;
using Events.Client.Contracts.Resources;

namespace Events.Client;

public class EventsClient(
    IEventResource events,
    IEventAttendeeResource attendees,
    IEventScheduleResource schedule,
    IEventSpeakerResource speakers,
    IEventSpeakerMapResource speakerMap) : IEventsClient
{
    public IEventResource Events { get; } = events;
    public IEventAttendeeResource Attendees { get; } = attendees;
    public IEventScheduleResource Schedule { get; } = schedule;
    public IEventSpeakerResource Speakers { get; } = speakers;
    public IEventSpeakerMapResource SpeakerMap { get; } = speakerMap;
}
