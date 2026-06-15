import React, { useState, useEffect, useContext } from 'react';

import './NetworkPage.css';
import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import NetworkSidebar from '../../features/NetworkSideBar/NetworkSidebar';
import ConnectionCard from '../../features/ConnectionCard/ConnectionCard';
import EventPanel from '../../features/EventPanel/EventPanel';
import ManageNetworkModal from '../../features/Modals/ManageNetworkModal/ManageNetworkModal';
import AppContext from '../../features/appContext/AppContext';
import { fileUrl } from '../../shared/api/files';

const NetworkPage = ({ onNavigate }) => {
  const { request } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('new');
  const [isManageNetworkModalOpen, setIsManageNetworkModalOpen] = useState(false);
  const [networkModalTab, setNetworkModalTab] = useState('contacts');

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================== LOAD SUGGESTIONS ========================
useEffect(() => {
  setLoading(true);
  request('api://network/suggestions')
    .then(r => {
      setConnections(Array.isArray(r) ? r : []);
    })
    .catch(err => {
      console.error('NETWORK ERROR:', err);
      setConnections([]);
    })
    .finally(() => setLoading(false));
}, [request]);

  return (
    <>
      <main className="main-content">
        <div className="container">
          <div className="network-grid">
            <aside className="sidebar-left">
              <NetworkSidebar
                onOpenManageNetwork={(tab) => {
                  setNetworkModalTab(tab);
                  setIsManageNetworkModalOpen(true);
                }}
              />
            </aside>

            <section className="network-main">
              <div className="network-tabs">
                <button
                  className={`network-tab ${activeTab === 'new' ? 'active' : ''}`}
                  onClick={() => setActiveTab('new')}
                >
                  New Connections
                </button>
                <button
                  className={`network-tab ${activeTab === 'event' ? 'active' : ''}`}
                  onClick={() => setActiveTab('event')}
                >
                  Activity
                </button>
              </div>

              {activeTab === 'new' ? (
                <div className="network-content">
                  <h2 className="network-section-title">
                    PEOPLE IN THE "UI/UX DESIGN" YOU MAY KNOW
                  </h2>

                  <div className="connections-grid">
                    {loading ? (
                      <div className="network-loading">Loading...</div>
                    ) : connections.length === 0 ? (
                      <div className="network-empty">
                        No suggestions yet
                      </div>
                    ) : (
                    connections.map(u => (
                    <ConnectionCard
                      key={u.id}
                      userId={u.id}
                      name={`${u.firstName} ${u.secondName}`}
                      title={u.profileTitle}
                      avatar={fileUrl(u.avatarUrl)}   // см. пункт 2
                      onNavigate={onNavigate}
                    />
                  ))

                    )}
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
      />
    </>
  );
};

export default NetworkPage;
