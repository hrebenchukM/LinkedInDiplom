import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import './NetworkPage.css';
import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import NetworkSidebar from '../../features/NetworkSideBar/NetworkSidebar';
import ConnectionCard from '../../features/ConnectionCard/ConnectionCard';
import AddContactSearch from '../../features/network/AddContactSearch.jsx';
import EventPanel from '../../features/EventPanel/EventPanel';
import ManageNetworkModal from '../../features/Modals/ManageNetworkModal/ManageNetworkModal';
import AppContext from '../../features/appContext/AppContext';
import {
  getIncomingContacts,
  getMyContacts,
  getMyGroups,
  getMyPages,
  getOutgoingContacts,
  getPendingContactCounts,
  getPeopleSuggestions,
} from '../../features/network/networkApi.js';
import {
  enrichContactsWithProfiles,
} from '../../features/network/enrichNetworkProfiles.js';
import {
  getNetworkPageCache,
  setNetworkPageCache,
} from '../../features/network/networkPageCache.js';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config.js';
import { getUserFriendlyErrorMessage } from '../../shared/lib/apiError.js';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import { PAGE_TRANSITION_MS } from '../../app/layout/pageTransitionTimings.js';

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
  const { t } = useTranslation();
  const { token, account, profile } = useContext(AppContext);
  const currentUserId = account?.id ?? account?.userId ?? null;
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const cachedSnapshot = getNetworkPageCache(currentUserId);
  const hasCachedData = Boolean(cachedSnapshot);

  const [activeTab, setActiveTab] = useState('new');
  const [isManageNetworkModalOpen, setIsManageNetworkModalOpen] = useState(false);
  const [networkModalTab, setNetworkModalTab] = useState('contacts');

  const [incoming, setIncoming] = useState(() => cachedSnapshot?.incoming ?? []);
  const [outgoing, setOutgoing] = useState(() => cachedSnapshot?.outgoing ?? []);
  const [contacts, setContacts] = useState(() => cachedSnapshot?.contacts ?? []);
  const [suggestions, setSuggestions] = useState(() => cachedSnapshot?.suggestions ?? []);
  const [pendingCounts, setPendingCounts] = useState(() => cachedSnapshot?.pendingCounts ?? {
    incoming: 0,
    outgoing: 0,
    contacts: 0,
    groups: 0,
    pages: 0,
  });

  const [loading, setLoading] = useState(() => !hasCachedData);
  const [refreshing, setRefreshing] = useState(false);
  const [pageEnterReady, setPageEnterReady] = useState(hasCachedData);
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
      groupsSettled,
      pagesSettled,
    ] = await Promise.allSettled([
      getMyContacts(pageParams),
      getIncomingContacts(pageParams),
      getOutgoingContacts(pageParams),
      getPendingContactCounts(),
      getMyGroups(),
      getMyPages(),
    ]);

    let contactsResult = { items: [], totalCount: 0 };
    let incomingResult = { items: [] };
    let outgoingResult = { items: [] };
    let counts = { incoming: 0, outgoing: 0 };
    let groupsCount = 0;
    let pagesCount = 0;

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

    if (groupsSettled.status === 'fulfilled') {
      groupsCount = groupsSettled.value.length;
    }

    if (pagesSettled.status === 'fulfilled') {
      pagesCount = pagesSettled.value.length;
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

    const suggestionQuery = getSuggestionSearchQuery(profileRef.current);
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
    const nextCounts = {
      incoming: counts.incoming ?? counts.incomingCount ?? 0,
      outgoing: counts.outgoing ?? counts.outgoingCount ?? 0,
      contacts: contactsResult.totalCount ?? enrichedContacts.length,
      groups: groupsCount,
      pages: pagesCount,
    };
    setPendingCounts(nextCounts);

    if (currentUserId) {
      setNetworkPageCache(currentUserId, {
        incoming: enrichedIncoming,
        outgoing: enrichedOutgoing,
        contacts: enrichedContacts,
        suggestions: peopleSuggestions,
        pendingCounts: nextCounts,
      });
    }
  }, [token, currentUserId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPageEnterReady(true);
    }, hasCachedData ? 0 : PAGE_TRANSITION_MS - 80);

    return () => window.clearTimeout(timer);
  }, [hasCachedData]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const cached = getNetworkPageCache(currentUserId);

    if (!cached) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    (async () => {
      try {
        await loadNetworkData();
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, currentUserId, loadNetworkData]);

  const handleActionComplete = async () => {
    setRefreshing(true);
    try {
      await loadNetworkData();
    } finally {
      setRefreshing(false);
    }
  };

  const hasNetworkData =
    incoming.length > 0 ||
    outgoing.length > 0 ||
    contacts.length > 0 ||
    suggestions.length > 0;

  const showInitialSkeleton = pageEnterReady && loading && !hasNetworkData;

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
      currentUserId={currentUserId}
    />
  );

  return (
    <>
      <main className={`main-content network-page${pageEnterReady ? ' network-page--ready' : ''}`}>
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
                  {t('network.tab.new', 'New Connections')}
                </button>
                <button
                  type="button"
                  className={`network-tab ${activeTab === 'event' ? 'active' : ''}`}
                  onClick={() => setActiveTab('event')}
                >
                  {t('network.tab.activity', 'Activity')}
                </button>
              </div>

              {activeTab === 'new' ? (
                <div className={`network-content${refreshing ? ' network-content--refreshing' : ''}`}>
                  <AddContactSearch
                    currentUserId={currentUserId}
                    onContactAdded={handleActionComplete}
                  />

                  {showInitialSkeleton ? (
                    <div className="network-skeleton" aria-hidden="true">
                      <div className="network-skeleton__grid">
                        <div className="network-skeleton__card" />
                        <div className="network-skeleton__card" />
                        <div className="network-skeleton__card" />
                      </div>
                    </div>
                  ) : null}

                  {contactsError ? <div className="auth-error">{contactsError}</div> : null}
                  {invitationsError ? <div className="auth-error">{invitationsError}</div> : null}

                  {!invitationsError && incoming.length > 0 ? (
                    <>
                      <h2 className="network-section-title">
                        {t('network.incomingRequests', 'Incoming requests ({n})', { n: incoming.length })}
                      </h2>
                      <div className="connections-grid">
                        {incoming.map(renderCard)}
                      </div>
                    </>
                  ) : null}

                  {!invitationsError && outgoing.length > 0 ? (
                    <div className="connections-grid">
                      {outgoing.map(renderCard)}
                    </div>
                  ) : null}

                  {!contactsError && contacts.length > 0 ? (
                    <div className="connections-grid">
                      {contacts.map(renderCard)}
                    </div>
                  ) : null}

                  {!showInitialSkeleton ? (
                    <>
                      <h2 className="network-section-title">
                        {t('network.peopleYouMayKnow', 'People you may know')}
                      </h2>

                      {suggestionsError ? (
                        <div className="auth-error">{suggestionsError}</div>
                      ) : null}

                      <div className="connections-grid">
                        {!suggestionsError && suggestions.length === 0 ? (
                          <div className="network-empty">{t('network.noSuggestions', 'No suggestions yet')}</div>
                        ) : null}

                        {suggestions.map(renderCard)}
                      </div>
                    </>
                  ) : null}
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
