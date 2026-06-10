import { apiClient } from "../../shared/api/client";
import { NETWORK } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";

export async function fetchMyContacts() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(NETWORK.myContacts);
  return Array.isArray(data) ? data : [];
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

export async function fetchMyFollowing() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(NETWORK.myFollowing);
  return Array.isArray(data) ? data : [];
}

export async function followUser(followingUserId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.post(NETWORK.myFollowing, { followingId: followingUserId });
}

export async function unfollowUser(followingUserId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(NETWORK.following(followingUserId));
}
