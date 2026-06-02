import { createContext, useContext, useMemo, useState } from "react";
import { initialNetworkPeople } from "../../shared/constants/mockData";
import { readJson, writeJson } from "../../shared/lib/storage";

const NETWORK_KEY = "spaNetworkPeople";
const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const [people, setPeople] = useState(() => readJson(NETWORK_KEY, initialNetworkPeople));

  const value = useMemo(
    () => ({
      people,
      connect(personId) {
        const next = people.filter((person) => person.id !== personId);
        setPeople(next);
        writeJson(NETWORK_KEY, next);
      },
    }),
    [people],
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetworkStore() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error("useNetworkStore must be used inside NetworkProvider");
  return ctx;
}
