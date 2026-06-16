import React from 'react';
import { Users, UserPlus, Users2, Calendar, FileText } from 'lucide-react';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import '../NetworkSideBar/NetworkSidebar.css';

const NetworkSidebar = ({ onOpenManageNetwork, counts = {} }) => {
  const { t } = useTranslation();

  const handleClick = (e, tab) => {
    e.preventDefault();
    onOpenManageNetwork?.(tab);
  };

  const badge = (value) =>
    value > 0 ? <span className="network-nav-badge">{value}</span> : null;

  return (
    <div className="network-sidebar">
      <h2 className="network-sidebar-title">
        {t('network.sidebar.title', 'Manage your network of contacts')}
      </h2>

      <nav className="network-nav">
        <a href="#" className="network-nav-item" onClick={(e) => handleClick(e, 'contacts')}>
          <Users size={20} />
          <span>{t('network.modal.contacts', 'Contacts')}</span>
          {badge(counts.contacts)}
        </a>
        <a href="#" className="network-nav-item" onClick={(e) => handleClick(e, 'following')}>
          <UserPlus size={20} />
          <span>{t('network.modal.following', 'People you follow')}</span>
        </a>
        <a href="#" className="network-nav-item" onClick={(e) => handleClick(e, 'groups')}>
          <Users2 size={20} />
          <span>{t('network.modal.groups', 'Groups')}</span>
          {badge(counts.groups)}
        </a>
        <a href="#" className="network-nav-item" onClick={(e) => handleClick(e, 'events')}>
          <Calendar size={20} />
          <span>{t('network.modal.events', 'Events')}</span>
        </a>
        <a href="#" className="network-nav-item" onClick={(e) => handleClick(e, 'pages')}>
          <FileText size={20} />
          <span>{t('network.modal.pages', 'Pages')}</span>
          {badge(counts.pages)}
        </a>
      </nav>

      {(counts.incoming > 0 || counts.outgoing > 0) && (
        <div className="network-pending-summary">
          {counts.incoming > 0 ? (
            <p>{t('network.incomingRequests', 'Incoming requests ({n})', { n: counts.incoming })}</p>
          ) : null}
          {counts.outgoing > 0 ? (
            <p>{t('network.pendingRequests', 'Pending requests ({n})', { n: counts.outgoing })}</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default NetworkSidebar;
