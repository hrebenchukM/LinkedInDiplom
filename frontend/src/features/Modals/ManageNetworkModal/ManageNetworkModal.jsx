import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from "react-router-dom";

import {
  Users,
  UserPlus,
  UsersRound,
  Calendar,
  FileText,
  CheckCircle,
  MapPin,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './ManageNetworkModal.css';
import Modal from '../../../app/ui/Modal';
import AppContext from '../../../features/appContext/AppContext';
import { fileUrl } from '../../../shared/api/files';

const ManageNetworkModal = ({ isOpen, onClose, initialTab }) => {
  const navigate = useNavigate();
  const { request } = useContext(AppContext);

  const [activeSection, setActiveSection] = useState(initialTab || 'contacts');
  const [loading, setLoading] = useState(false);

  const [contactsData, setContactsData] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [groupsData, setGroupsData] = useState([]);
const [eventsData, setEventsData] = useState([]);

  const [pagesData, setPagesData] = useState([]);

  useEffect(() => {
    if (initialTab) {
      setActiveSection(initialTab);
    }
  }, [initialTab]);

  // ================= LOAD DATA =================
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    const loaders = {
      contacts: () =>
        request('api://contacts').then(setContactsData),

      following: () =>
        request('api://contacts/following').then(setFollowingData),

      groups: () =>
        request('api://groups/my').then(setGroupsData),

      pages: () =>
        request('api://pages/my').then(setPagesData),

      events: () =>
        request('api://events/my').then(setEventsData),
    };

    loaders[activeSection]?.()
      .catch(err => console.error('MANAGE NETWORK ERROR:', err))
      .finally(() => setLoading(false));

  }, [activeSection, isOpen, request]);

  const sections = [
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'following', label: 'People you follow', icon: UserPlus },
    { id: 'groups', label: 'Groups', icon: UsersRound },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'pages', label: 'Pages', icon: FileText }
  ];

  const renderContent = () => {
    if (loading) {
      return <div className="network-loading">Loading...</div>;
    }

    switch (activeSection) {

      // ================= CONTACTS =================
      case 'contacts':
        return (
          <div className="network-content">
            {contactsData.map(u => (
              <div key={u.id} className="network-item">
                <img
                  src={fileUrl(u.avatarUrl)}
                  alt={u.firstName}
                  className="network-item-avatar"
                />
                <div className="network-item-info">
                  <h4>{u.firstName} {u.secondName}</h4>
                  <p>{u.profileTitle}</p>
                </div>
                <button className="network-item-action">Message</button>
              </div>
            ))}
          </div>
        );

      // ================= FOLLOWING =================
      case 'following':
        return (
          <div className="network-content">
            {followingData.map(u => (
              <div key={u.id} className="network-item">
                <img
                  src={fileUrl(u.avatarUrl)}
                  alt={u.firstName}
                  className="network-item-avatar"
                />
                <div className="network-item-info">
                  <h4>{u.firstName} {u.secondName}</h4>
                  <p>{u.profileTitle}</p>
                </div>
                <button className="network-item-action network-item-action-secondary">
                  Following
                </button>
              </div>
            ))}
          </div>
        );

      // ================= GROUPS =================
      case 'groups':
        return (
          <div className="network-content">
            {groupsData.map(g => (
              <div key={g.groupId} className="network-item">
                 <img
                  src={
                    g.avatarUrl
                      ? fileUrl(g.avatarUrl)
                      : '/assets/group-placeholder.png'
                  }
                  alt={g.name}
                  className="network-item-avatar"
                />
                <div className="network-item-info">
                <Link to={`/app/groups/${g.groupId}`}>
                  {g.name}
                </Link>
                  <p className="network-group-category">{g.description}</p>
                  <div className="network-group-stats">
                    <span>{g.membersCount} members</span>
                  </div>
                </div>
            <button
              className="network-item-action"
              onClick={() => {
                onClose();
                navigate(`/app/groups/${g.groupId}`);
              }}
            >
              View Group
            </button>
              </div>
            ))}
          </div>
        );

      // ================= EVENTS =================
      case 'events':
        return (
          <div className="network-content">
            {eventsData.map(e => (
              <div key={e.event.id} className="network-event-item">
                <img
                src={
                  e.event.coverImageUrl
                    ? fileUrl(e.event.coverImageUrl)
                    : '/assets/event-placeholder.jpg'
                }
                alt={e.event.title}
                className="network-event-image"
              />
                <div className="network-event-content">
                <div className="network-event-header">
                  <h4>{e.event.title}</h4>

                  <span
                    className={`network-event-type ${
                      e.event.isOnline || e.event.is_online ? 'virtual' : 'in-person'
                    }`}
                  >
                    {e.event.isOnline || e.event.is_online ? 'Online' : 'In person'}
                  </span>
                </div>

                  <div className="network-event-details">
                    <div className="network-event-detail">
                      <Calendar size={14} />
                      <span>
                        {new Date(e.event.startAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="network-event-detail">
                      <Clock size={14} />
                      <span>
                        {new Date(e.event.startAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="network-event-detail">
                      <MapPin size={14} />
                     <span>
                      {e.event.is_online ? 'Online' : e.event.location}
                    </span>


                    </div>
                  </div>

                  <div className="network-event-footer">
                    <span className="network-event-attendees">
                      {e.attendeesCount} attendees
                    </span>
                    <button
                      className="network-item-action"
                      onClick={() => {
                        onClose();
                        navigate(`/app/event/${e.event.id}`);
                      }}
                    >
                      View Event
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      // ================= PAGES =================
      case 'pages':
        return (
          <div className="network-content">
            {pagesData.map(p => (
              <div key={p.pageId} className="network-item">
                <img
                  src={fileUrl(p.logoUrl)}
                  alt={p.name}
                  className="network-item-avatar"
                />
                <div className="network-item-info">
                  <div className="network-page-name">
                    <h4>{p.name}</h4>
                    <CheckCircle size={16} fill="#0ea5e9" color="white" />
                  </div>
                  <p>{p.description}</p>
                  <span className="mutual-connections">
                    {p.followersCount} followers
                  </span>
                </div>
                <button
                  className="network-item-action"
                  onClick={() => {
                    onClose();
                    navigate(`/app/company/${p.pageId}`);
                  }}
                >
                  View Page
                </button>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage your network"
      className="manage-network-modal-content"
    >
      <div className="manage-network-modal">
        <div className="network-sidebar">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className={`network-section-btn ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon size={20} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        <div className="network-main">
          <div className="network-search">
            <input type="text" placeholder="Search..." />
          </div>
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
};

export default ManageNetworkModal;
