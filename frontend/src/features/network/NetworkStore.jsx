import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { initialNetworkPeople } from "../../shared/constants/mockData";
import { useBackendApi } from "../../shared/hooks/useBackendApi";
import { readJson, writeJson } from "../../shared/lib/storage";
import { fetchProfilesByUserIds } from "../profile/profileApi";
import { buildDisplayContacts } from "./buildDisplayContacts";
import { mapContactDtoToPerson } from "./mapNetwork";
import * as networkApi from "./networkApi";

const NETWORK_KEY = "spaNetworkPeople";
const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const { session } = useAuth();
  const useApi = useBackendApi();
  const [people, setPeople] = useState(() => readJson(NETWORK_KEY, initialNetworkPeople));
  const [pendingContacts, setPendingContacts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const reloadFromApi = useCallback(async () => {
    if (!useApi) return;
    setIsLoading(true);
    setLoadError("");
    try {
      const contacts = await networkApi.fetchMyContacts();
      const followingList = await networkApi.fetchMyFollowing();
      const userIds = contacts.flatMap((c) => [c.requesterId, c.receiverId]);
      const profiles = await fetchProfilesByUserIds(userIds);
      const currentUserId = session.user?.id;

      const accepted = [];
      const pending = [];

      contacts.forEach((contact) => {
        const status = String(contact.status || "").toLowerCase();
        const otherId =
          String(contact.requesterId) === String(currentUserId) ? contact.receiverId : contact.requesterId;
        const person = mapContactDtoToPerson(contact, profiles[otherId], currentUserId);
        if (status === "accepted") accepted.push(person);
        else if (status === "pending") {
          const isIncoming = String(contact.receiverId) === String(currentUserId);
          pending.push({ ...person, isIncoming });
        }
      });

      const displayPeople = buildDisplayContacts(accepted);
      setPeople(displayPeople);
      setPendingContacts(pending);
      setFollowing(followingList);
      if (displayPeople.length > 0) {
        writeJson(NETWORK_KEY, displayPeople);
      }
    } catch (error) {
      setLoadError(error?.message || "Failed to load contacts.");
      const cached = readJson(NETWORK_KEY, initialNetworkPeople);
      setPeople(cached.length > 0 ? cached : buildDisplayContacts([]));
    } finally {
      setIsLoading(false);
    }
  }, [useApi, session.user?.id]);

  useEffect(() => {
    if (!useApi) {
      setPeople(readJson(NETWORK_KEY, initialNetworkPeople));
      setPendingContacts([]);
      return;
    }
    reloadFromApi();
  }, [useApi, reloadFromApi]);

  const value = useMemo(
    () => ({
      people,
      pendingContacts,
      following,
      isLoading,
      loadError,
      useApi,
      reloadFromApi,
      async acceptContact(contactId) {
        await networkApi.acceptContact(contactId);
        await reloadFromApi();
      },
      async rejectContact(contactId) {
        await networkApi.rejectContact(contactId);
        await reloadFromApi();
      },
      async connect(personId) {
        const person = people.find((p) => p.id === personId);
        if (useApi && person?.userId) {
          try {
            await networkApi.sendContactRequest(person.userId);
            await reloadFromApi();
            return;
          } catch {
            // fall through
          }
        }
        const next = people.filter((p) => p.id !== personId);
        setPeople(next);
        writeJson(NETWORK_KEY, next);
      },
      async followUser(userId) {
        if (!useApi || !userId) return;
        await networkApi.followUser(userId);
        await reloadFromApi();
      },
    }),
    [people, pendingContacts, following, isLoading, loadError, useApi, reloadFromApi],
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetworkStore() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error("useNetworkStore must be used inside NetworkProvider");
  return ctx;
}
