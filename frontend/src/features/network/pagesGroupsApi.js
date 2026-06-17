import { apiClient } from "../../shared/api/client";
import { API_PATHS } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { unwrapPagedItems } from "../../shared/lib/pagedResponse";
import { normalizeGroupDto, normalizeGroupMemberDto, normalizePageDto } from "./mapNetwork";

function unwrapList(data, normalize) {
  return unwrapPagedItems(data, normalize);
}

export async function fetchMyPages() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(API_PATHS.network.myPages);
  return unwrapList(data, normalizePageDto);
}

export async function fetchFollowedPages() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(API_PATHS.network.pageFollowing);
  return unwrapList(data, normalizePageDto);
}

export async function followPage(pageId) {
  if (USE_MOCK_AUTH || !pageId) return null;
  return apiClient.post(API_PATHS.network.pageFollow(pageId));
}

export async function unfollowPage(pageId) {
  if (USE_MOCK_AUTH || !pageId) return null;
  return apiClient.delete(API_PATHS.network.pageFollow(pageId));
}

export async function fetchMyGroups() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(API_PATHS.network.myGroups);
  return unwrapList(data, normalizeGroupDto);
}

export async function fetchGroupMembers(groupId) {
  if (USE_MOCK_AUTH || !groupId) return [];
  const data = await apiClient.get(API_PATHS.network.groupMembers(groupId));
  return unwrapList(data, normalizeGroupMemberDto);
}
