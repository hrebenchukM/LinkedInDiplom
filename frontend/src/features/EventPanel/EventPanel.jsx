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
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const EVENT_FILTERS = [
  { id: 'all', key: 'eventPanel.filter.all' },
  { id: 'upcoming', key: 'eventPanel.filter.upcoming' },
  { id: 'online', key: 'eventPanel.filter.online' },
  { id: 'in-person', key: 'eventPanel.filter.inPerson' },
];

const EventPanel = () => {
  const { t } = useTranslation();
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
          setLoadError(err?.message || t('network.events.loadFailed', 'Could not load events.'));
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
          {EVENT_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`event-filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {t(filter.key, filter.id)}
          </button>
          ))}
        </div>

        <div className="event-content">
          {loading ? (
            <div className="event-loading">{t('eventPanel.loading', 'Loading events...')}</div>
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
                  alt={t('eventPanel.noEventsAlt', 'No events')}
                  className="event-empty-img"
                />
              </div>

              <h3 className="event-empty-title">
                {loadError
                  ? t('eventPanel.loadErrorTitle', 'Could not load events')
                  : t('eventPanel.emptyTitle', 'No upcoming events')}
              </h3>
              <p className="event-empty-description">
                {loadError
                  ? t('eventPanel.loadErrorSub', 'Discover events are shown here instead of network activity feed.')
                  : t('eventPanel.emptySub', 'Check back later for new events in your network.')}
              </p>

              <button
                type="button"
                className="expand-network-btn"
                onClick={() => setIsManageNetworkModalOpen(true)}
              >
                {t('eventPanel.expandNetwork', 'Expand network of contacts')}
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
