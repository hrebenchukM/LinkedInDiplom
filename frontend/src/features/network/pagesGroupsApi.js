import { apiClient } from "../../shared/api/client";
import { NETWORK } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { unwrapPagedItems } from "../../shared/lib/pagedResponse";
import { normalizeGroupDto, normalizeGroupMemberDto, normalizePageDto } from "./mapNetwork";

function unwrapList(data, normalize) {
  return unwrapPagedItems(data, normalize);
}

export async function fetchMyPages() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(NETWORK.myPages);
  return unwrapList(data, normalizePageDto);
}

export async function fetchFollowedPages() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(NETWORK.myFollowedPages);
  return unwrapList(data, normalizePageDto);
}

export async function followPage(pageId) {
  if (USE_MOCK_AUTH || !pageId) return null;
  return apiClient.post(NETWORK.pageFollow(pageId));
}

export async function unfollowPage(pageId) {
  if (USE_MOCK_AUTH || !pageId) return null;
  return apiClient.delete(NETWORK.pageFollow(pageId));
}

export async function fetchMyGroups() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(NETWORK.myGroups);
  return unwrapList(data, normalizeGroupDto);
}

export async function fetchGroupMembers(groupId) {
  if (USE_MOCK_AUTH || !groupId) return [];
  const data = await apiClient.get(NETWORK.groupMembers(groupId));
  return unwrapList(data, normalizeGroupMemberDto);
}
