using Events.Client.Contracts.Resources;

namespace Events.Client.Contracts;

public interface IEventsClient
{
    IEventResource Events { get; }
    IEventAttendeeResource Attendees { get; }
    IEventScheduleResource Schedule { get; }
    IEventSpeakerResource Speakers { get; }
    IEventSpeakerMapResource SpeakerMap { get; }
}
