import * as contentApi from "./contentApi";
import { mapPostsWithAuthors } from "./mapPostsWithAuthors";

export async function loadUserPostsFromApi(
  authorUserId,
  currentUserId,
  displayName,
  userAvatar,
  { page = 1, pageSize = 20 } = {},
) {
  const paged = await contentApi.fetchUserPosts(authorUserId, { page, pageSize });
  const posts = await mapPostsWithAuthors(paged.items, currentUserId, displayName, userAvatar);

  return {
    posts,
    page: paged.page,
    pageSize: paged.pageSize,
    totalCount: paged.totalCount,
    totalPages: paged.totalPages,
    hasNextPage: paged.hasNextPage,
    hasPreviousPage: paged.hasPreviousPage,
  };
}
