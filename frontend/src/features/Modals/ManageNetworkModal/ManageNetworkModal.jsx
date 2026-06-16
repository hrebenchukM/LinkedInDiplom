import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Users,
  UserPlus,
  UsersRound,
  Calendar,
  FileText,
  CheckCircle,
  MapPin,
  Clock,
} from 'lucide-react';

import './ManageNetworkModal.css';
import Modal from '../../../app/ui/Modal';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../../shared/api/files';
import SafeImage from '../../../shared/ui/SafeImage';
import {
  getMyContacts,
  getFollowing,
  getMyGroups,
  getMyPages,
  unfollowUser,
} from '../../network/networkApi.js';
import {
  enrichContactsWithProfiles,
  enrichUsersWithProfiles,
} from '../../network/enrichNetworkProfiles.js';
import { openChatWithUser } from '../../network/openChatWithUser.js';
import AddContactSearch from '../../network/AddContactSearch.jsx';
import { getMyAttendingEvents, leaveEvent } from '../../events/eventsApi.js';
import { enrichEventsWithOrganizers } from '../../events/enrichEventsWithOrganizers.js';
import { DEFAULT_PAGE_SIZE } from '../../../shared/api/config.js';
import { getErrorMessage, getUserFriendlyErrorMessage } from '../../../shared/lib/apiError.js';
import { useTranslation } from '../../../app/i18n/LocaleContext.jsx';

const ManageNetworkModal = ({
  isOpen,
  onClose,
  initialTab,
  onNavigate,
  currentUserId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState(initialTab || 'contacts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [contactsData, setContactsData] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [groupsData, setGroupsData] = useState([]);
  const [pagesData, setPagesData] = useState([]);
  const [eventsData, setEventsData] = useState([]);

  useEffect(() => {
    if (initialTab) {
      setActiveSection(initialTab);
    }
  }, [initialTab]);

  const loadSection = async (section) => {
    setLoading(true);
    setError('');

    const pageParams = { page: 1, pageSize: DEFAULT_PAGE_SIZE };

    try {
      switch (section) {
        case 'contacts': {
          const result = await getMyContacts(pageParams);
          const enriched = await enrichContactsWithProfiles(
            result.items,
            currentUserId,
          );
          setContactsData(enriched);
          break;
        }
        case 'following': {
          const follows = await getFollowing();
          const enriched = await enrichUsersWithProfiles(
            follows,
            (item) => item.followingId ?? item.userId,
          );
          setFollowingData(enriched);
          break;
        }
        case 'groups': {
          setGroupsData(await getMyGroups());
          break;
        }
        case 'pages': {
          setPagesData(await getMyPages());
          break;
        }
        case 'events': {
          const result = await getMyAttendingEvents(pageParams);
          const enriched = await enrichEventsWithOrganizers(result.items);
          setEventsData(enriched);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.warn('MANAGE NETWORK ERROR:', err);
      setError(getUserFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadSection(activeSection);
  }, [activeSection, isOpen, currentUserId]);

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
      await loadSection('following');
    } catch (err) {
      setError(getUserFriendlyErrorMessage(err));
    }
  };

  const handleMessageContact = async (userId) => {
    try {
      onClose();
      await openChatWithUser({
        targetUserId: userId,
        currentUserId,
        navigate,
      });
    } catch (err) {
      setError(getUserFriendlyErrorMessage(err));
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      await leaveEvent(eventId);
      await loadSection('events');
    } catch (err) {
      setError(getUserFriendlyErrorMessage(err));
    }
  };

  const sections = [
    { id: 'contacts', labelKey: 'network.modal.contacts', icon: Users },
    { id: 'following', labelKey: 'network.modal.following', icon: UserPlus },
    { id: 'groups', labelKey: 'network.modal.groups', icon: UsersRound },
    { id: 'events', labelKey: 'network.modal.events', icon: Calendar },
    { id: 'pages', labelKey: 'network.modal.pages', icon: FileText },
  ];

  const renderContent = () => {
    if (loading) {
      return <div className="network-loading">{t('common.loading', 'Loading...')}</div>;
    }

    if (error) {
      return <div className="auth-error">{error}</div>;
    }

    switch (activeSection) {
      case 'contacts':
        return (
          <div className="network-content">
            <AddContactSearch
              currentUserId={currentUserId}
              compact
              onContactAdded={() => loadSection('contacts')}
            />

            {contactsData.length === 0 ? (
              <div className="network-empty">{t('network.modal.noContacts', 'No contacts yet')}</div>
            ) : (
              contactsData.map((u) => (
                <div key={u.contactId ?? u.userId} className="network-item">
                  <img
                    src={getAssetUrl(u.avatarUrl, IMAGE_PLACEHOLDERS.avatar)}
                    alt={u.name}
                    className="network-item-avatar"
                  />
                  <div className="network-item-info">
                    <h4>{u.name}</h4>
                    <p>{u.title ?? u.headline}</p>
                    <span className="network-item-badge">
                      {t('network.contact.connected', 'Connected')}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="network-item-action"
                    onClick={() => handleMessageContact(u.userId)}
                  >
                    {t('network.contact.message', 'Message')}
                  </button>
                </div>
              ))
            )}
          </div>
        );

      case 'following':
        return (
          <div className="network-content">
            {followingData.length === 0 ? (
              <div className="network-empty">{t('network.modal.noFollowing', 'Not following anyone yet')}</div>
            ) : null}
            {followingData.map((u) => (
              <div key={u.id ?? u.userId} className="network-item">
                <img
                  src={getAssetUrl(u.avatarUrl || u.avatar, IMAGE_PLACEHOLDERS.avatar)}
                  alt={u.name}
                  className="network-item-avatar"
                />
                <div className="network-item-info">
                  <h4>{u.name}</h4>
                  <p>{u.headline ?? u.profileTitle}</p>
                </div>
                <button
                  type="button"
                  className="network-item-action network-item-action-secondary"
                  onClick={() => handleUnfollow(u.followingId ?? u.userId)}
                >
                  {t('network.modal.unfollow', 'Unfollow')}
                </button>
              </div>
            ))}
          </div>
        );

      case 'groups':
        return (
          <div className="network-content">
            {groupsData.length === 0 ? (
              <div className="network-empty">{t('network.modal.noGroups', 'No groups yet')}</div>
            ) : null}
            {groupsData.map((g) => (
              <div key={g.groupId ?? g.id} className="network-item">
                <img
                  src={getAssetUrl(g.imageUrl || g.avatarUrl, IMAGE_PLACEHOLDERS.cover)}
                  alt={g.name}
                  className="network-item-avatar"
                />
                <div className="network-item-info">
                  <Link to={`/app/groups/${g.groupId ?? g.id}`}>{g.name}</Link>
                  <p className="network-group-category">{g.description}</p>
                  <div className="network-group-stats">
                    <span>{t('group.membersCount', '{n} members', { n: g.membersCount ?? 0 })}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="network-item-action"
                  onClick={() => {
                    onClose();
                    navigate(`/app/groups/${g.groupId ?? g.id}`);
                  }}
                >
                  {t('network.modal.viewGroup', 'View Group')}
                </button>
              </div>
            ))}
          </div>
        );

      case 'events':
        return (
          <div className="network-content">
            {eventsData.length === 0 ? (
              <div className="network-empty">
                {t('network.events.emptyAttending', 'You are not attending any events yet.')}
              </div>
            ) : null}
            {eventsData.map((eventItem) => (
              <div key={eventItem.id} className="network-event-item">
                <SafeImage
                  src={getAssetUrl(
                    eventItem.coverUrl || eventItem.coverImageUrl,
                    IMAGE_PLACEHOLDERS.event,
                  )}
                  fallback={IMAGE_PLACEHOLDERS.event}
                  alt={eventItem.title}
                  className="network-event-image"
                />
                <div className="network-event-content">
                  <div className="network-event-header">
                    <h4>{eventItem.title}</h4>
                    <span
                      className={`network-event-type ${eventItem.isOnline ? 'virtual' : 'in-person'}`}
                    >
                      {eventItem.isOnline
                        ? t('event.virtual', 'Virtual')
                        : t('event.inPerson', 'In-person')}
                    </span>
                  </div>
                  <div className="network-event-details">
                    <div className="network-event-detail">
                      <Calendar size={14} />
                      <span>{eventItem.date || t('event.dateTbd', 'Date TBD')}</span>
                    </div>
                    <div className="network-event-detail">
                      <Clock size={14} />
                      <span>{eventItem.time || t('event.timeTbd', 'Time TBD')}</span>
                    </div>
                    {eventItem.location && (
                      <div className="network-event-detail">
                        <MapPin size={14} />
                        <span>{eventItem.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="network-event-footer">
                    <span className="network-event-attendees">
                      {t('event.attendeesCount', '{n} attendees', {
                        n: eventItem.attendeesCount ?? 0,
                      })}
                    </span>
                    <button
                      type="button"
                      className="network-item-action network-item-action-secondary"
                      onClick={() => {
                        onClose();
                        navigate(`/app/event/${eventItem.id}`);
                      }}
                    >
                      {t('network.modal.view', 'View')}
                    </button>
                    <button
                      type="button"
                      className="network-item-action network-item-action-secondary"
                      onClick={() => handleLeaveEvent(eventItem.id)}
                    >
                      {t('network.events.leave', 'Leave')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'pages':
        return (
          <div className="network-content">
            {pagesData.length === 0 ? (
              <div className="network-empty">{t('network.modal.noPages', 'No pages yet')}</div>
            ) : null}
            {pagesData.map((p) => (
              <div key={p.pageId ?? p.id} className="network-item">
                <img
                  src={getAssetUrl(p.imageUrl || p.logoUrl, IMAGE_PLACEHOLDERS.company)}
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
                    {t('network.modal.followersCount', '{n} followers', {
                      n: p.followersCount ?? 0,
                    })}
                  </span>
                </div>
                <button
                  type="button"
                  className="network-item-action"
                  onClick={() => {
                    onClose();
                    navigate(`/app/company/${p.pageId ?? p.id}`);
                  }}
                >
                  {t('network.modal.viewPage', 'View Page')}
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
      title={t('network.modal.title', 'Manage your network')}
      className="manage-network-modal-content"
    >
      <div className="manage-network-modal">
        <div className="network-sidebar">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                className={`network-section-btn ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon size={20} />
                <span>{t(section.labelKey, section.id)}</span>
              </button>
            );
          })}
        </div>

        <div className="network-main">
          <div className="network-search">
            <input type="text" placeholder={t('network.modal.search', 'Search...')} />
          </div>
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
};

export default ManageNetworkModal;
