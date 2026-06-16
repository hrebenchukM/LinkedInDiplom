import React, { useContext, useEffect, useMemo } from 'react';
import Header from './Header';
import Footer from './Footer';
import PageTransitionOutlet from '../layout/PageTransitionOutlet.jsx';
import AppContext from '../../features/appContext/AppContext.js';
import { isDemoAccountEmail } from '../../features/auth/demoAccount.js';
import AiAssistantHomeToast from '../../features/AiAssistantHomeToast/AiAssistantHomeToast.jsx';
import { getEmailFromToken } from '../../shared/lib/jwtClaims.js';
import { debugLog, describeButton } from '../../shared/lib/debugSession.js';
import './Layout.css';

const Layout = () => {
  const { user, token } = useContext(AppContext);
  const isDemo = useMemo(
    () => isDemoAccountEmail(user?.email ?? getEmailFromToken(token)),
    [user?.email, token],
  );
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
      <AiAssistantHomeToast
        enabled={Boolean(token)}
        isDemo={isDemo}
        delayMs={isDemo ? 2000 : 10000}
      />
    </div>
  );
};

export default Layout;
