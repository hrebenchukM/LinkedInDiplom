import React from 'react';
import { Users, UserPlus, Users2, Calendar, FileText } from 'lucide-react';
import '../NetworkSideBar/NetworkSidebar.css';

const NetworkSidebar = ({ onOpenManageNetwork }) => {
  const handleClick = (e, tab) => {
    e.preventDefault();
    if (onOpenManageNetwork) {
      onOpenManageNetwork(tab);
    }
  };

  return (
    <div className="network-sidebar">
      <h2 className="network-sidebar-title">Manage your network of contacts</h2>

      <nav className="network-nav">
        <a href="#" className="network-nav-item" onClick={(e) => handleClick(e, 'contacts')}>
          <Users size={20} />
          <span>Contacts</span>
        </a>
        <a href="#" className="network-nav-item" onClick={(e) => handleClick(e, 'following')}>
          <UserPlus size={20} />
          <span>People you follow</span>
        </a>
        <a href="#" className="network-nav-item" onClick={(e) => handleClick(e, 'groups')}>
          <Users2 size={20} />
          <span>Groups</span>
        </a>
        <a href="#" className="network-nav-item" onClick={(e) => handleClick(e, 'events')}>
          <Calendar size={20} />
          <span>Events</span>
        </a>
        <a href="#" className="network-nav-item" onClick={(e) => handleClick(e, 'pages')}>
          <FileText size={20} />
          <span>Pages</span>
        </a>
      </nav>
    </div>
  );
};

export default NetworkSidebar;
