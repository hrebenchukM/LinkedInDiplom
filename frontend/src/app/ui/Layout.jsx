import React, { useContext, useMemo } from 'react';
import Header from './Header';
import Footer from './Footer';
import PageTransitionOutlet from '../layout/PageTransitionOutlet.jsx';
import AppContext from '../../features/appContext/AppContext.js';
import { isDemoAccountEmail } from '../../features/auth/demoAccount.js';
import AiAssistantHomeToast from '../../features/AiAssistantHomeToast/AiAssistantHomeToast.jsx';
import { getEmailFromToken } from '../../shared/lib/jwtClaims.js';
import { useMessagingRealtime } from '../../features/messaging/useMessagingRealtime.js';
import './Layout.css';

const Layout = () => {
  const { user, token, account } = useContext(AppContext);
  const currentUserId = account?.id ?? account?.userId ?? null;
  const isDemo = useMemo(
    () => isDemoAccountEmail(user?.email ?? getEmailFromToken(token)),
    [user?.email, token],
  );

  useMessagingRealtime(Boolean(token), currentUserId);

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
