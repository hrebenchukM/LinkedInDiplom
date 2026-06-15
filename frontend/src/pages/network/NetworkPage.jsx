import React, { useCallback, useContext, useEffect, useState } from 'react';

import './NetworkPage.css';
import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import NetworkSidebar from '../../features/NetworkSideBar/NetworkSidebar';
import ConnectionCard from '../../features/ConnectionCard/ConnectionCard';
import EventPanel from '../../features/EventPanel/EventPanel';
import ManageNetworkModal from '../../features/Modals/ManageNetworkModal/ManageNetworkModal';
import AppContext from '../../features/appContext/AppContext';
import {
  getIncomingContacts,
  getMyContacts,
  getOutgoingContacts,
  getPendingContactCounts,
  getPeopleSuggestions,
} from '../../features/network/networkApi.js';
import {
  enrichContactsWithProfiles,
} from '../../features/network/enrichNetworkProfiles.js';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config.js';
import { getUserFriendlyErrorMessage } from '../../shared/lib/apiError.js';

function getSuggestionSearchQuery(profile) {
  const user = profile?.user ?? profile;
  const candidates = [
    user?.headline,
    user?.profileTitle,
    user?.firstName,
    user?.university,
    user?.location,
  ];

  return candidates.find((value) => typeof value === 'string' && value.trim())?.trim() ?? '';
}

const NetworkPage = ({ onNavigate }) => {
  const { token, account, profile } = useContext(AppContext);
  const currentUserId = account?.id ?? account?.userId ?? null;

  const [activeTab, setActiveTab] = useState('new');
  const [isManageNetworkModalOpen, setIsManageNetworkModalOpen] = useState(false);
  const [networkModalTab, setNetworkModalTab] = useState('contacts');

  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [pendingCounts, setPendingCounts] = useState({
    incoming: 0,
    outgoing: 0,
    contacts: 0,
    groups: 0,
    pages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [contactsError, setContactsError] = useState('');
  const [invitationsError, setInvitationsError] = useState('');
  const [suggestionsError, setSuggestionsError] = useState('');

  const loadNetworkData = useCallback(async () => {
    if (!token) return;

    setContactsError('');
    setInvitationsError('');
    setSuggestionsError('');

    const pageParams = { page: 1, pageSize: DEFAULT_PAGE_SIZE };

    const [
      contactsSettled,
      incomingSettled,
      outgoingSettled,
      countsSettled,
    ] = await Promise.allSettled([
      getMyContacts(pageParams),
      getIncomingContacts(pageParams),
      getOutgoingContacts(pageParams),
      getPendingContactCounts(),
    ]);

    let contactsResult = { items: [], totalCount: 0 };
    let incomingResult = { items: [] };
    let outgoingResult = { items: [] };
    let counts = { incoming: 0, outgoing: 0 };

    if (contactsSettled.status === 'fulfilled') {
      contactsResult = contactsSettled.value;
    } else {
      setContactsError(getUserFriendlyErrorMessage(contactsSettled.reason));
    }

    if (incomingSettled.status === 'fulfilled') {
      incomingResult = incomingSettled.value;
    }

    if (outgoingSettled.status === 'fulfilled') {
      outgoingResult = outgoingSettled.value;
    }

    const invitationFailure =
      incomingSettled.status === 'rejected'
        ? incomingSettled.reason
        : outgoingSettled.status === 'rejected'
          ? outgoingSettled.reason
          : null;

    if (invitationFailure) {
      setInvitationsError(getUserFriendlyErrorMessage(invitationFailure));
    }

    if (countsSettled.status === 'fulfilled') {
      counts = countsSettled.value;
    }

    const enrichedContacts = contactsSettled.status === 'fulfilled'
      ? await enrichContactsWithProfiles(contactsResult.items, currentUserId)
      : [];
    const enrichedIncoming = incomingSettled.status === 'fulfilled'
      ? await enrichContactsWithProfiles(incomingResult.items, currentUserId)
      : [];
    const enrichedOutgoing = outgoingSettled.status === 'fulfilled'
      ? await enrichContactsWithProfiles(outgoingResult.items, currentUserId)
      : [];

    setContacts(enrichedContacts);
    setIncoming(enrichedIncoming);
    setOutgoing(enrichedOutgoing);

    const suggestionQuery = getSuggestionSearchQuery(profile);
    let peopleSuggestions = [];

    if (suggestionQuery) {
      try {
        peopleSuggestions = await getPeopleSuggestions(pageParams, {
          currentUserId,
          searchQuery: suggestionQuery,
          contacts: [
            ...contactsResult.items,
            ...incomingResult.items,
            ...outgoingResult.items,
          ],
          incoming: incomingResult.items,
          outgoing: outgoingResult.items,
        });
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[network] suggestions error:', err);
        }
        setSuggestionsError(getUserFriendlyErrorMessage(err));
      }
    }

    setSuggestions(peopleSuggestions);
    setPendingCounts({
      incoming: counts.incoming ?? counts.incomingCount ?? 0,
      outgoing: counts.outgoing ?? counts.outgoingCount ?? 0,
      contacts: contactsResult.totalCount ?? enrichedContacts.length,
      groups: 0,
      pages: 0,
    });
  }, [token, currentUserId, profile]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        await loadNetworkData();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, loadNetworkData]);

  const handleActionComplete = async () => {
    setLoading(true);
    try {
      await loadNetworkData();
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (card) => (
    <ConnectionCard
      key={card.contactId ?? card.userId ?? card.id}
      userId={card.userId}
      contactId={card.contactId ?? card.id}
      name={card.name}
      title={card.title ?? card.headline ?? card.profileTitle}
      avatar={card.avatar}
      cardType={card.cardType}
      onActionComplete={handleActionComplete}
    />
  );

  return (
    <>
      <main className="main-content network-page">
        <div className="container">
          <div className="network-grid">
            <aside className="sidebar-left">
              <NetworkSidebar
                counts={pendingCounts}
                onOpenManageNetwork={(tab) => {
                  setNetworkModalTab(tab);
                  setIsManageNetworkModalOpen(true);
                }}
              />
            </aside>

            <section className="network-main">
              <div className="network-tabs">
                <button
                  type="button"
                  className={`network-tab ${activeTab === 'new' ? 'active' : ''}`}
                  onClick={() => setActiveTab('new')}
                >
                  New Connections
                </button>
                <button
                  type="button"
                  className={`network-tab ${activeTab === 'event' ? 'active' : ''}`}
                  onClick={() => setActiveTab('event')}
                >
                  Activity
                </button>
              </div>

              {activeTab === 'new' ? (
                <div className="network-content">
                  {loading ? (
                    <div className="network-loading">Loading...</div>
                  ) : null}

                  {contactsError ? <div className="auth-error">{contactsError}</div> : null}
                  {invitationsError ? <div className="auth-error">{invitationsError}</div> : null}

                  {!loading && !invitationsError && incoming.length > 0 ? (
                    <>
                      <h2 className="network-section-title">
                        INCOMING REQUESTS ({incoming.length})
                      </h2>
                      <div className="connections-grid">
                        {incoming.map(renderCard)}
                      </div>
                    </>
                  ) : null}

                  {!loading && !invitationsError && outgoing.length > 0 ? (
                    <>
                      <h2 className="network-section-title">
                        PENDING REQUESTS ({outgoing.length})
                      </h2>
                      <div className="connections-grid">
                        {outgoing.map(renderCard)}
                      </div>
                    </>
                  ) : null}

                  {!loading && !contactsError && contacts.length > 0 ? (
                    <>
                      <h2 className="network-section-title">
                        YOUR CONTACTS ({contacts.length})
                      </h2>
                      <div className="connections-grid">
                        {contacts.map(renderCard)}
                      </div>
                    </>
                  ) : null}

                  <h2 className="network-section-title">
                    PEOPLE YOU MAY KNOW
                  </h2>

                  {suggestionsError ? (
                    <div className="auth-error">{suggestionsError}</div>
                  ) : null}

                  <div className="connections-grid">
                    {!loading && !suggestionsError && suggestions.length === 0 ? (
                      <div className="network-empty">No suggestions yet</div>
                    ) : null}

                    {!loading && suggestions.map(renderCard)}
                  </div>
                </div>
              ) : (
                <EventPanel />
              )}
            </section>

            <aside className="sidebar-right">
              <MessagesPanel
                onNavigate={onNavigate}
                onSelectChat={() => {}}
              />
            </aside>
          </div>
        </div>
      </main>

      <ManageNetworkModal
        isOpen={isManageNetworkModalOpen}
        onClose={() => setIsManageNetworkModalOpen(false)}
        initialTab={networkModalTab}
        onNavigate={onNavigate}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default NetworkPage;
