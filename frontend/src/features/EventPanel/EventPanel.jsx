import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../EventPanel/EventPanel.css';
import nonewNetworkImg from '../../shared/assets/illustrations/no-new-network-updates.png';
import EventCard from '../EventCard/EventCard';
import ManageNetworkModal from '../Modals/ManageNetworkModal/ManageNetworkModal';
import { discoverEvents } from '../events/eventsApi';
import { enrichEventsWithOrganizers } from '../events/enrichEventsWithOrganizers';
import {
  filterUpcomingEvents,
  sortEventsByStartAt,
} from '../events/mapEvents';

const EventPanel = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isManageNetworkModalOpen, setIsManageNetworkModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError('');

    discoverEvents({ page: 1, pageSize: 5 })
      .then(async (response) => {
        if (cancelled) return;
        const enriched = await enrichEventsWithOrganizers(response.items);
        const sorted = sortEventsByStartAt(enriched, 'asc');
        setEvents(sorted);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('EVENTS DISCOVER ERROR:', err);
          setLoadError(err?.message || 'Failed to load events');
          setEvents([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    switch (activeFilter) {
      case 'upcoming':
        return filterUpcomingEvents(events);
      case 'online':
        return events.filter((event) => event.isOnline);
      case 'in-person':
        return events.filter((event) => !event.isOnline);
      default:
        return events;
    }
  }, [events, activeFilter]);

  return (
    <>
      <div className="event-panel">
        <div className="event-filters">
          <button
            type="button"
            className={`event-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`event-filter-btn ${activeFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveFilter('upcoming')}
          >
            Upcoming
          </button>
          <button
            type="button"
            className={`event-filter-btn ${activeFilter === 'online' ? 'active' : ''}`}
            onClick={() => setActiveFilter('online')}
          >
            Online
          </button>
          <button
            type="button"
            className={`event-filter-btn ${activeFilter === 'in-person' ? 'active' : ''}`}
            onClick={() => setActiveFilter('in-person')}
          >
            In-person
          </button>
        </div>

        <div className="event-content">
          {loading ? (
            <div className="event-loading">Loading events...</div>
          ) : filteredEvents.length > 0 ? (
            <div className="event-list">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onOpen={(eventId) => navigate(`/app/event/${eventId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="event-empty">
              <div className="event-illustration">
                <img
                  src={nonewNetworkImg}
                  alt="No events"
                  className="event-empty-img"
                />
              </div>

              <h3 className="event-empty-title">
                {loadError ? 'Could not load events' : 'No upcoming events'}
              </h3>
              <p className="event-empty-description">
                {loadError
                  ? 'Discover events are shown here instead of network activity feed.'
                  : 'Check back later for new events in your network.'}
              </p>

              <button
                type="button"
                className="expand-network-btn"
                onClick={() => setIsManageNetworkModalOpen(true)}
              >
                Expand network of contacts
              </button>
            </div>
          )}
        </div>
      </div>

      <ManageNetworkModal
        isOpen={isManageNetworkModalOpen}
        onClose={() => setIsManageNetworkModalOpen(false)}
      />
    </>
  );
};

export default EventPanel;
