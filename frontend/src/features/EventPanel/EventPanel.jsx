import React, { useState,useEffect } from 'react';
import '../EventPanel/EventPanel.css';
import nonewNetworkImg from '../../shared/assets/illustrations/no-new-network-updates.png';
import EventCard from '../EventCard/EventCard';
import ManageNetworkModal from '../Modals/ManageNetworkModal/ManageNetworkModal';
import { useContext } from 'react';
import AppContext from '../appContext/AppContext';


const EventPanel = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isManageNetworkModalOpen, setIsManageNetworkModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
const { request } = useContext(AppContext);

useEffect(() => {
  setLoading(true);

  request('api://network/activity')
    .then(r => {
      setEvents(Array.isArray(r) ? r : []);
    })
    .catch(err => {
      console.error('ACTIVITY ERROR:', err);
      setEvents([]);
    })
    .finally(() => setLoading(false));
}, [request]);


  const filteredEvents = activeFilter === 'all'
    ? events
    : events.filter(event => event.action === activeFilter);

  return (
    <>
    <div className="event-panel">
      <div className="event-filters">
        <button
          className={`event-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button
          className={`event-filter-btn ${activeFilter === 'career' ? 'active' : ''}`}
          onClick={() => setActiveFilter('career')}
        >
          Career changes
        </button>
        <button
          className={`event-filter-btn ${activeFilter === 'birthday' ? 'active' : ''}`}
          onClick={() => setActiveFilter('birthday')}
        >
          Birthdays
        </button>
        <button
          className={`event-filter-btn ${activeFilter === 'education' ? 'active' : ''}`}
          onClick={() => setActiveFilter('education')}
        >
          Education
        </button>
      </div>

      <div className="event-content">
        {loading ? (
          <div className="event-loading">Loading events...</div>
        ) : filteredEvents.length > 0 ? (
          <div className="event-list">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="event-empty">
            <div className="event-illustration">
                <img src={nonewNetworkImg} alt="No new network updates" className="event-empty-img"/>
            </div>

            <h3 className="event-empty-title">No recent updates</h3>
            <p className="event-empty-description">
              As your network of contacts expands, you will receive more updates.
            </p>

            <button className="expand-network-btn" onClick={() => setIsManageNetworkModalOpen(true)}>
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
