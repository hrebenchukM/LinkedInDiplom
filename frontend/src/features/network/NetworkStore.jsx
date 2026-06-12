import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useBackendApi } from "../../shared/hooks/useBackendApi";
import { withLoadState } from "../../shared/lib/asyncLoad";
import { fetchProfilesByUserIds } from "../profile/profileApi";
import { buildDisplayContacts } from "./buildDisplayContacts";
import * as blockedUsersApi from "./blockedUsersApi";
import {
  buildRelationshipIndex,
  getUserRelationship,
  mapBlockedUserToPerson,
  mapContactDtoToPerson,
  mapFollowerToPerson,
  mapFollowToPerson,
  mapGroupToView,
  mergePagesForDisplay,
} from "./mapNetwork";
import * as networkApi from "./networkApi";
import * as pagesGroupsApi from "./pagesGroupsApi";

const NETWORK_KEY = "spaNetworkPeople";
const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const { session } = useAuth();
  const useApi = useBackendApi();
  const [people, setPeople] = useState([]);
  const [incomingContacts, setIncomingContacts] = useState([]);
  const [outgoingContacts, setOutgoingContacts] = useState([]);
  const [followingPeople, setFollowingPeople] = useState([]);
  const [followerPeople, setFollowerPeople] = useState([]);
  const [blockedPeople, setBlockedPeople] = useState([]);
  const [pages, setPages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [pendingContactCounts, setPendingContactCounts] = useState({ incomingCount: 0, outgoingCount: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const reloadFromApi = useCallback(async () => {
    if (!useApi) return;
    const result = await withLoadState({ setIsLoading, setLoadError }, async () => {
      const [
        contacts,
        incoming,
        outgoing,
        followingList,
        followersList,
        blockedList,
        myPages,
        followedPages,
        groupsList,
        pendingCounts,
      ] = await Promise.all([
        networkApi.fetchMyContacts(),
        networkApi.fetchIncomingContacts(),
        networkApi.fetchOutgoingContacts(),
        networkApi.fetchMyFollowing(),
        networkApi.fetchMyFollowers(),
        blockedUsersApi.fetchMyBlockedUsers(),
        pagesGroupsApi.fetchMyPages(),
        pagesGroupsApi.fetchFollowedPages(),
        pagesGroupsApi.fetchMyGroups(),
        networkApi.fetchPendingContactCounts(),
      ]);
      setPendingContactCounts(pendingCounts);
      const contactUserIds = [...contacts, ...incoming, ...outgoing].flatMap((c) => [c.requesterId, c.receiverId]);
      const followingUserIds = followingList.map((item) => item.followingId).filter(Boolean);
      const followerUserIds = followersList.map((item) => item.followerId).filter(Boolean);
      const blockedUserIds = blockedList.map((item) => item.blockedUserId).filter(Boolean);
      const profiles = await fetchProfilesByUserIds([
        ...new Set([...contactUserIds, ...followingUserIds, ...followerUserIds, ...blockedUserIds]),
      ]);
      const currentUserId = session.user?.id;

      const mapPending = (contact, isIncoming) => {
        const otherId = isIncoming ? contact.requesterId : contact.receiverId;
        return { ...mapContactDtoToPerson(contact, profiles[otherId], currentUserId), isIncoming };
      };

      const accepted = contacts.map((contact) => {
        const otherId =
          String(contact.requesterId) === String(currentUserId) ? contact.receiverId : contact.requesterId;
        return mapContactDtoToPerson(contact, profiles[otherId], currentUserId);
      });

      setPeople(buildDisplayContacts(accepted));
      setIncomingContacts(incoming.map((contact) => mapPending(contact, true)));
      setOutgoingContacts(outgoing.map((contact) => mapPending(contact, false)));
      setFollowingPeople(
        followingList.map((follow) => mapFollowToPerson(follow, profiles[follow.followingId])),
      );
      setFollowerPeople(
        followersList.map((follow) => mapFollowerToPerson(follow, profiles[follow.followerId])),
      );
      setBlockedPeople(
        blockedList.map((block) => mapBlockedUserToPerson(block, profiles[block.blockedUserId])),
      );
      setPages(mergePagesForDisplay(myPages, followedPages));
      const groupsWithCounts = await Promise.all(
        groupsList.map(async (group) => {
          try {
            const members = await pagesGroupsApi.fetchGroupMembers(group.id);
            return mapGroupToView(group, { memberCount: members.length });
          } catch {
            return mapGroupToView(group, { memberCount: 0 });
          }
        }),
      );
      setGroups(groupsWithCounts);
    }, "Failed to load contacts.");

    if (result === null) {
      setPeople([]);
    }
  }, [useApi, session.user?.id]);

  useEffect(() => {
    if (!useApi) {
      setPeople([]);
      setIncomingContacts([]);
      setOutgoingContacts([]);
      setFollowingPeople([]);
      setFollowerPeople([]);
      setBlockedPeople([]);
      setPages([]);
      setGroups([]);
      setPendingContactCounts({ incomingCount: 0, outgoingCount: 0 });
      return;
    }

    try {
      localStorage.removeItem(NETWORK_KEY);
      localStorage.removeItem("networkUnfollowedHandles");
    } catch {
      // ignore storage errors
    }

    reloadFromApi();
  }, [useApi, reloadFromApi]);

  const relationshipIndex = useMemo(
    () =>
      buildRelationshipIndex({
        acceptedPeople: people,
        incomingContacts,
        outgoingContacts,
        followingPeople,
        blockedPeople,
      }),
    [people, incomingContacts, outgoingContacts, followingPeople, blockedPeople],
  );

  const value = useMemo(
    () => ({
      people,
      incomingContacts,
      outgoingContacts,
      pendingContactCounts,
      followingPeople,
      followerPeople,
      blockedPeople,
      pages,
      groups,
      relationshipIndex,
      getRelationship: (userId) => getUserRelationship(relationshipIndex, userId),
      followedUserIds: new Set(followingPeople.map((person) => String(person.userId)).filter(Boolean)),
      blockedUserIds: new Set(blockedPeople.map((person) => String(person.userId)).filter(Boolean)),
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
        if (!useApi || !person?.userId) return;
        try {
          await networkApi.sendContactRequest(person.userId);
          await reloadFromApi();
        } catch {
          // ignore
        }
      },
      async connectWithUser(userId) {
        if (!useApi || !userId) return;
        await networkApi.sendContactRequest(userId);
        await reloadFromApi();
      },
      async followUser(userId) {
        if (!useApi || !userId) return;
        await networkApi.followUser(userId);
        await reloadFromApi();
      },
      async unfollowUser(userId) {
        if (!useApi || !userId) return;
        await networkApi.unfollowUser(userId);
        await reloadFromApi();
      },
      async blockUser(userId) {
        if (!useApi || !userId) return;
        await blockedUsersApi.blockUser(userId);
        await reloadFromApi();
      },
      async unblockUser(userId) {
        if (!useApi || !userId) return;
        await blockedUsersApi.unblockUser(userId);
        await reloadFromApi();
      },
      async followPage(pageId) {
        if (!useApi || !pageId) return;
        await pagesGroupsApi.followPage(pageId);
        await reloadFromApi();
      },
      async unfollowPage(pageId) {
        if (!useApi || !pageId) return;
        await pagesGroupsApi.unfollowPage(pageId);
        await reloadFromApi();
      },
    }),
    [
      people,
      incomingContacts,
      outgoingContacts,
      pendingContactCounts,
      followingPeople,
      followerPeople,
      blockedPeople,
      pages,
      groups,
      relationshipIndex,
      isLoading,
      loadError,
      useApi,
      reloadFromApi,
    ],
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetworkStore() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error("useNetworkStore must be used inside NetworkProvider");
  return ctx;
}
