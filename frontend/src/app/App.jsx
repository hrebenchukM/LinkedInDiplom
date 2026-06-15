import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import AppContext from '../features/appContext/AppContext';
import Base64 from '../shared/base64/Base64';

// public
import SplashPage from '../pages/splash/Splash';
import LandingPage from '../pages/landing/Landing';
import AuthPage from '../pages/auth/Auth';

// app
import Layout from './ui/Layout';
import HomePage from '../pages/home/HomePage';
import NetworkPage from '../pages/network/NetworkPage';
import VacanciesPage from '../pages/vacancies/VacanciesPage';
import MessagesPage from '../pages/messages/MessagesPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import ProfilePage from '../pages/profile/ProfilePage';
import PortfolioPage from '../pages/portfolio/PortfolioPage';
import GroupPage from '../pages/group/GroupPage';
import EventPage from '../pages/event/EventPage';
import CompanyPage from '../pages/company/CompanyPage';
import ChatMain from '../features/ChatMain/ChatMain';

export default function App() {

  
  // ================= STATE =================
  const [token, setToken] = useState(null);
  const [tokenReady, setTokenReady] = useState(false);

  const [user, setUser] = useState(null);        // из JWT
  const [profile, setProfile] = useState(null);  // из БД
const logout = () => {
  // 1️⃣ React state
  setToken(null);
  setUser(null);
  setProfile(null);

  // 2️⃣ localStorage
  localStorage.removeItem('token');

  // 3️⃣ cookie (ВАЖНО: тот же Path!)
  document.cookie =
    'token=; Path=/JavaWeb222; Max-Age=0; SameSite=Lax';

  // 4️⃣ редирект
  window.location.href = '/landing';
};


  // ================= REQUEST =================
  const request = (url, conf = {}, isFull = false) =>
    new Promise((resolve, reject) => {

      if (!token) {
        reject("NO_TOKEN");
        return;
      }

      const backUrl = 'http://localhost:8080/JavaWeb222/';
      url = url.replace('api://', backUrl);

      conf.headers ??= {};
      conf.headers.Authorization ??= 'Bearer ' + token;

      fetch(url, conf)
        .then(r => r.json())
        .then(j => {
          if (j.status?.isOk) resolve(isFull ? j : j.data);
          else reject(j);
        })
        .catch(reject);
    });

  // ================= TOKEN RESTORE =================
useEffect(() => {
  const savedToken = localStorage.getItem('token');
  if (savedToken) {
    setToken(savedToken);
    document.cookie =
      `token=${encodeURIComponent(savedToken)}; Path=/JavaWeb222; SameSite=Lax`;
  }
  setTokenReady(true);
}, []);


  // ================= USER FROM JWT =================
  useEffect(() => {
    if (typeof token === 'string' && token.split('.').length === 3) {
      const payload = Base64.jwtDecodePayload(token);
      setUser({
        id: payload.sub,
        aud: payload.aud,
        email: payload.email,
        name: payload.name,
        dob: payload.dob ?? null,
      });
            console.log(token);
    } else {
      setUser(null);
      setProfile(null);
    }
  }, [token]);

  // ================= PROFILE BOOTSTRAP =================
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const profile = await request("api://user/profile");
        if (!cancelled) {
          setProfile(profile);
        }
      } catch (err) {
        console.error("Profile bootstrap error:", err);
        if (!cancelled) setProfile(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ================= GUARD =================
  if (!tokenReady) {
    return null; // splash / loader
  }

  // ================= RENDER =================
  return (
    <AppContext.Provider
      value={{
        token,
        setToken,
        user,
        profile,
        setProfile,
        request,
        logout
      }}
    >
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<SplashPage />} />

          {/* PUBLIC */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* PROTECTED APP */}
          <Route
            path="/app"
            element={token ? <Layout /> : <Navigate to="/landing" />}
          >
            <Route index element={<HomePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="network" element={<NetworkPage />} />
            <Route path="vacancies" element={<VacanciesPage />} />

            <Route path="messages" element={<MessagesPage />}>
              </Route>
              <Route path="messages/:chatId" element={<MessagesPage />} />
           

            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile/:username" element={<ProfilePage />} />
            <Route path="portfolio/:username" element={<PortfolioPage />} />
            <Route path="groups/:id" element={<GroupPage />} />
            <Route path="event/:id" element={<EventPage />} />
            <Route path="company/:id" element={<CompanyPage />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
