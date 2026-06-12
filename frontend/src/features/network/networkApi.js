import { apiClient } from "../../shared/api/client";
import { NETWORK } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { unwrapPagedItems, unwrapPagedResponse } from "../../shared/lib/pagedResponse";
import { normalizeContactDto, normalizeFollowDto, normalizePendingContactCounts } from "./mapNetwork";

function buildContactsQuery({
  page = 1,
  pageSize = 50,
  status,
  direction,
  search,
  sortBy = "requestedAt",
  sortDirection = "desc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy: String(sortBy),
    sortDirection: String(sortDirection),
  });
  if (status) {
    params.set("status", String(status));
    params.set("direction", direction || "accepted");
  } else if (direction) {
    params.set("direction", String(direction));
  }
  if (search) params.set("search", String(search));
  return params.toString();
}

async function fetchContactItems(path, query = {}) {
  if (USE_MOCK_AUTH) return [];
  const qs = buildContactsQuery(query);
  const data = await apiClient.get(qs ? `${path}?${qs}` : path);
  return unwrapPagedResponse(data, normalizeContactDto).items;
}

/** Accepted contacts — `GET /api/network/me/contacts?status=accepted`. */
export async function fetchMyContacts({ page = 1, pageSize = 50 } = {}) {
  return fetchContactItems(NETWORK.myContacts, { page, pageSize, status: "accepted" });
}

/** Pending incoming requests — `GET /api/network/me/contacts/incoming`. */
export async function fetchIncomingContacts({ page = 1, pageSize = 50 } = {}) {
  return fetchContactItems(NETWORK.incomingContacts, { page, pageSize });
}

/** Pending outgoing requests — `GET /api/network/me/contacts/outgoing`. */
export async function fetchOutgoingContacts({ page = 1, pageSize = 50 } = {}) {
  return fetchContactItems(NETWORK.outgoingContacts, { page, pageSize });
}

/** Pending badge counts — `GET /api/network/me/contacts/pending-counts`. */
export async function fetchPendingContactCounts() {
  if (USE_MOCK_AUTH) return { incomingCount: 0, outgoingCount: 0 };
  const data = await apiClient.get(NETWORK.pendingContactCounts);
  return normalizePendingContactCounts(data);
}

export async function sendContactRequest(receiverId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.post(NETWORK.myContacts, { receiverId });
}

export async function acceptContact(contactId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.patch(NETWORK.acceptContact(contactId));
}

export async function rejectContact(contactId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.patch(NETWORK.rejectContact(contactId));
}

function unwrapFollowList(data) {
  return unwrapPagedItems(data, normalizeFollowDto).filter((item) => item && !item.unfollowedAt);
}

export async function fetchMyFollowing() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(NETWORK.myFollowing);
  return unwrapFollowList(data);
}

/** Users who follow me — `GET /api/network/me/followers`. */
export async function fetchMyFollowers() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(NETWORK.myFollowers);
  return unwrapFollowList(data);
}

export async function followUser(followingUserId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.post(NETWORK.myFollowing, { followingId: followingUserId });
}

export async function unfollowUser(followingUserId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(NETWORK.following(followingUserId));
}
