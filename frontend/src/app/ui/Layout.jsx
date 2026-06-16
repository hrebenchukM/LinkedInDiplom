import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import PageTransitionOutlet from '../layout/PageTransitionOutlet.jsx';
import { debugLog, describeButton } from '../../shared/lib/debugSession.js';
import './Layout.css';

const Layout = () => {
  useEffect(() => {
    const onClickCapture = (event) => {
      const button = event.target?.closest?.('button');
      if (!button) return;

      const info = describeButton(button);

      // #region agent log
      debugLog(
        'Layout.jsx:click-capture',
        'button clicked',
        info,
        info.disabled ? 'C' : 'general',
      );
      // #endregion
    };

    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, []);

  return (
    <div className="layout">
      <Header />
      <main>
        <PageTransitionOutlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
