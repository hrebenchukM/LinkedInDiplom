const { createContext, useContext, useMemo, useState, useEffect } = React;

const AuthContext = createContext(null);
const UiContext = createContext(null);
const DataContext = createContext(null);

function readFromStorage(key, fallback) {
  if (!window.spaStorage) return fallback;
  return window.spaStorage.readJson(key, fallback);
}

function asObject(value, fallback) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

function asArray(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

function writeToStorage(key, value) {
  if (!window.spaStorage) return;
  window.spaStorage.writeJson(key, value);
}

function useAuthProvider() {
  const [session, setSession] = useState(() => {
    const raw = readFromStorage("authSession", null);
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
  });
  const [account, setAccount] = useState(() => asObject(readFromStorage("registeredAccount", {}), {}));

  useEffect(() => {
    writeToStorage("authSession", session);
  }, [session]);

  useEffect(() => {
    writeToStorage("registeredAccount", account || {});
  }, [account]);

  const value = useMemo(
    () => ({
      session,
      account,
      isAuthed: Boolean(session),
      logout: () => setSession(null),
      setSession,
      setAccount,
    }),
    [session, account]
  );
  return value;
}

function useUiProvider() {
  const [notice, setNotice] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const pushNotice = (text) => {
    const message = String(text || "").trim();
    if (!message) return;
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };

  const value = useMemo(
    () => ({
      notice,
      searchOpen,
      setSearchOpen,
      pushNotice,
    }),
    [notice, searchOpen]
  );
  return value;
}

function useDataProvider() {
  const [feedPosts, setFeedPosts] = useState(() => asArray(readFromStorage("homeFeedPosts", []), []));
  const [homeChats, setHomeChats] = useState(() => asArray(readFromStorage("homeChats", []), []));
  const [notifications, setNotifications] = useState(() => asArray(readFromStorage("uiNotifications", []), []));
  const [applications, setApplications] = useState(() => asObject(readFromStorage("vacancyApplications", {}), {}));
  const [savedJobs, setSavedJobs] = useState(() => asObject(readFromStorage("vacancySavedJobs", {}), {}));

  useEffect(() => writeToStorage("homeFeedPosts", feedPosts), [feedPosts]);
  useEffect(() => writeToStorage("homeChats", homeChats), [homeChats]);
  useEffect(() => writeToStorage("uiNotifications", notifications), [notifications]);
  useEffect(() => writeToStorage("vacancyApplications", applications), [applications]);
  useEffect(() => writeToStorage("vacancySavedJobs", savedJobs), [savedJobs]);

  const value = useMemo(
    () => ({
      feedPosts,
      setFeedPosts,
      homeChats,
      setHomeChats,
      notifications,
      setNotifications,
      applications,
      setApplications,
      savedJobs,
      setSavedJobs,
    }),
    [feedPosts, homeChats, notifications, applications, savedJobs]
  );
  return value;
}

function AppProviders({ children }) {
  const auth = useAuthProvider();
  const ui = useUiProvider();
  const data = useDataProvider();
  return (
    <AuthContext.Provider value={auth}>
      <UiContext.Provider value={ui}>
        <DataContext.Provider value={data}>{children}</DataContext.Provider>
      </UiContext.Provider>
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

function useUi() {
  return useContext(UiContext);
}

function useData() {
  return useContext(DataContext);
}

window.SpaCtx = {
  AppProviders,
  useAuth,
  useUi,
  useData,
};
