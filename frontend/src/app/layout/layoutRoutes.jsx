import { HomePage } from "../../pages/home/HomePage";
import { NetworkPage } from "../../pages/network/NetworkPage";
import { VacanciesPage } from "../../pages/vacancies/VacanciesPage";
import { ChatPage } from "../../pages/chat/ChatPage";
import { ProfilePage } from "../../pages/profile/ProfilePage";

/** Child routes rendered inside AppLayout (paths match createBrowserRouter). */
export const layoutChildRoutes = [
  { path: "/home", element: <HomePage /> },
  { path: "/network", element: <NetworkPage /> },
  { path: "/vacancies", element: <VacanciesPage /> },
  { path: "/chat", element: <ChatPage /> },
  { path: "/profile", element: <ProfilePage /> },
];
