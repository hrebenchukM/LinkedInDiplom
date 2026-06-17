import apiClient from '../../shared/api/client.js';

import { API_PATHS } from '../../shared/api/paths.js';

import { DEFAULT_PAGE_SIZE } from '../../shared/api/config.js';

import { buildPaginationQuery } from '../../shared/lib/pagination.js';

import {

  DEFAULT_CONTACTS_QUERY,

  NETWORK_CONTACT_DIRECTION,

  NETWORK_CONTACT_SORT_BY,

  NETWORK_CONTACT_STATUS,

  normalizeSortDirection,

  pickAllowedValue,

} from '../../shared/api/sortParams.js';

import { searchProfiles } from '../profile/profileApi.js';

import {

  mapBlockedUserDto,

  mapContactDto,

  mapContactListResponse,

  mapFollowList,

  mapGroupDto,

  mapGroupList,

  mapGroupMemberList,

  mapGroupPostList,

  mapPageDto,

  mapPageList,

  mapPendingCountsDto,

  mapPersonSuggestion,

  getContactOtherUserId,

  unwrapList,

} from './mapNetwork.js';



function buildPagedQuery(params = {}) {

  return buildPaginationQuery({

    page: params.page,

    pageSize: params.pageSize ?? params.limit,

  });

}



function buildContactsQuery(params = {}) {
  const merged = { ...DEFAULT_CONTACTS_QUERY, ...params };

  return buildPaginationQuery({
    page: merged.page,
    pageSize: merged.pageSize ?? merged.limit,
    search: merged.search ?? merged.query,
    sortBy:
      pickAllowedValue(merged.sortBy, NETWORK_CONTACT_SORT_BY) ??
      DEFAULT_CONTACTS_QUERY.sortBy,
    sortDirection:
      normalizeSortDirection(merged.sortDirection) ??
      DEFAULT_CONTACTS_QUERY.sortDirection,
    extra: {
      status:
        pickAllowedValue(merged.status, NETWORK_CONTACT_STATUS) ??
        DEFAULT_CONTACTS_QUERY.status,
      direction:
        pickAllowedValue(merged.direction, NETWORK_CONTACT_DIRECTION) ??
        DEFAULT_CONTACTS_QUERY.direction,
    },
  });
}



// Contacts

export async function getMyContacts(params = {}) {

  const query = buildContactsQuery(params);

  const response = await apiClient.get(API_PATHS.network.contacts, { query });

  return mapContactListResponse(response);

}



export async function getIncomingContacts(params = {}) {

  const query = buildPagedQuery(params);

  const response = await apiClient.get(API_PATHS.network.incomingContacts, { query });

  return mapContactListResponse(response);

}



export async function getOutgoingContacts(params = {}) {

  const query = buildPagedQuery(params);

  const response = await apiClient.get(API_PATHS.network.outgoingContacts, { query });

  return mapContactListResponse(response);

}



export async function getPendingContactCounts() {

  const response = await apiClient.get(API_PATHS.network.pendingCounts);

  return mapPendingCountsDto(response);

}



export async function sendContactRequest(receiverId) {

  const response = await apiClient.post(API_PATHS.network.contacts, { receiverId });

  const contactDto = response?.contact ?? response?.Contact ?? response;

  return mapContactDto(contactDto) ?? response;

}



export async function acceptContactRequest(contactId) {

  const response = await apiClient.patch(API_PATHS.network.acceptContact(contactId));

  const contactDto = response?.contact ?? response?.Contact ?? response;

  return mapContactDto(contactDto) ?? response;

}



export async function rejectContactRequest(contactId) {

  const response = await apiClient.patch(API_PATHS.network.rejectContact(contactId));

  const contactDto = response?.contact ?? response?.Contact ?? response;

  return mapContactDto(contactDto) ?? response;

}



export async function cancelContactRequest(contactId) {

  const response = await apiClient.delete(API_PATHS.network.cancelContact(contactId));

  const contactDto = response?.contact ?? response?.Contact ?? response;

  return mapContactDto(contactDto) ?? response;

}



export async function removeContact(contactId) {

  const response = await apiClient.delete(API_PATHS.network.contactById(contactId));

  const contactDto = response?.contact ?? response?.Contact ?? response;

  return mapContactDto(contactDto) ?? response;

}



// Following

export async function getFollowing() {

  try {

    const response = await apiClient.get(API_PATHS.network.following);

    return mapFollowList(unwrapList(response));

  } catch {

    return [];

  }

}



export async function followUser(userId) {

  return apiClient.post(API_PATHS.network.following, { followingId: userId });

}



export async function unfollowUser(userId) {

  return apiClient.delete(API_PATHS.network.followingByUserId(userId));

}



// Blocked users

export async function getBlockedUsers(params = {}) {

  try {

    const response = await apiClient.get(API_PATHS.network.blockedUsers, {

      query: buildPagedQuery(params),

    });

    return unwrapList(response).map(mapBlockedUserDto).filter(Boolean);

  } catch {

    return [];

  }

}



export async function blockUser(userId) {

  return apiClient.post(API_PATHS.network.blockedUsers, { blockedUserId: userId });

}



export async function unblockUser(userId) {

  return apiClient.delete(API_PATHS.network.blockedUserById(userId));

}



// Suggestions (frontend workaround via profile search)

export async function getPeopleSuggestions(params = {}, options = {}) {
  const {
    currentUserId = null,
    excludeUserIds = [],
    contacts = [],
    incoming = [],
    outgoing = [],
    searchQuery = '',
  } = options;

  const excludeSet = new Set(excludeUserIds.filter(Boolean));

  if (currentUserId) {
    excludeSet.add(currentUserId);
  }

  [...contacts, ...incoming, ...outgoing].forEach((contact) => {
    const otherId = getContactOtherUserId(contact, currentUserId);
    if (otherId) excludeSet.add(otherId);
    if (contact.requesterId) excludeSet.add(contact.requesterId);
    if (contact.receiverId) excludeSet.add(contact.receiverId);
    if (contact.userId) excludeSet.add(contact.userId);
  });

  const queryText = String(params.query ?? params.search ?? searchQuery ?? '').trim();
  if (!queryText) {
    return [];
  }

  try {
    const searchResults = await searchProfiles({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
      query: queryText,
    });

    return searchResults
      .filter((profile) => profile.userId && !excludeSet.has(profile.userId))
      .map(mapPersonSuggestion)
      .filter(Boolean);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[network] suggestions failed:', error);
    }
    return [];
  }
}



// Groups / Pages

export async function getMyGroups() {

  try {

    const response = await apiClient.get(API_PATHS.network.groups);

    return mapGroupList(unwrapList(response));

  } catch {

    return [];

  }

}



export async function getMyPages() {

  try {

    const response = await apiClient.get(API_PATHS.network.pages);

    return mapPageList(unwrapList(response));

  } catch {

    return [];

  }

}



export async function getGroupById(groupId) {

  const dto = await apiClient.get(API_PATHS.network.groupById(groupId));

  return mapGroupDto(dto);

}



export async function getPageById(pageId) {

  const dto = await apiClient.get(API_PATHS.network.pageById(pageId));

  return mapPageDto(dto);

}



export async function getGroupMembers(groupId) {

  try {

    const response = await apiClient.get(API_PATHS.network.groupMembers(groupId));

    return mapGroupMemberList(unwrapList(response));

  } catch {

    return [];

  }

}



export async function getGroupPosts(groupId) {

  try {

    const response = await apiClient.get(API_PATHS.network.groupPosts(groupId));

    return mapGroupPostList(unwrapList(response));

  } catch {

    return [];

  }

}



export async function followPage(pageId) {

  return apiClient.post(API_PATHS.network.pageFollow(pageId));

}



export async function unfollowPage(pageId) {

  return apiClient.delete(API_PATHS.network.pageFollow(pageId));

}



export async function getPageFollowers(pageId) {

  try {

    const response = await apiClient.get(API_PATHS.network.pageFollowers(pageId));

    return unwrapList(response);

  } catch {

    return [];

  }

}



export async function getMyFollowedPages() {

  try {

    const response = await apiClient.get(API_PATHS.network.pageFollowing);

    return mapPageList(unwrapList(response));

  } catch {

    return [];

  }

}



export async function joinGroup(groupId) {

  return apiClient.post(API_PATHS.network.groupJoin(groupId));

}



export async function leaveGroup(groupId) {

  return apiClient.delete(API_PATHS.network.groupMembership(groupId));

}



export async function attachPostToGroup(groupId, postId) {

  return apiClient.post(API_PATHS.network.groupAttachPost(groupId, postId));

}

export async function getFollowers() {
  try {
    const response = await apiClient.get(API_PATHS.network.followers);
    return mapFollowList(unwrapList(response));
  } catch {
    return [];
  }
}

/** Legacy aliases used by NetworkStore and older components. */
export async function fetchMyContacts(params = {}) {
  const result = await getMyContacts(params);
  return result.items ?? [];
}

export async function fetchIncomingContacts(params = {}) {
  const result = await getIncomingContacts(params);
  return result.items ?? [];
}

export async function fetchOutgoingContacts(params = {}) {
  const result = await getOutgoingContacts(params);
  return result.items ?? [];
}

export async function fetchPendingContactCounts() {
  return getPendingContactCounts();
}

export async function fetchMyFollowing() {
  return getFollowing();
}

export async function fetchMyFollowers() {
  return getFollowers();
}

