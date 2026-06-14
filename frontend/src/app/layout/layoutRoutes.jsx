import { HomePage } from "../../pages/home/HomePage";
import { NetworkPage } from "../../pages/network/NetworkPage";
import { VacanciesPage } from "../../pages/vacancies/VacanciesPage";
import { ChatPage } from "../../pages/chat/ChatPage";
import { ProfilePage } from "../../pages/profile/ProfilePage";
import { UserProfilePage } from "../../pages/profile/UserProfilePage";

/** Child routes rendered inside AppLayout (paths match createBrowserRouter). */
export const layoutChildRoutes = [
  { path: "/home", element: <HomePage /> },
  { path: "/network", element: <NetworkPage /> },
  { path: "/vacancies", element: <VacanciesPage /> },
  { path: "/chat", element: <ChatPage /> },
  { path: "/profile/:userId", element: <UserProfilePage /> },
  { path: "/profile", element: <ProfilePage /> },
];
