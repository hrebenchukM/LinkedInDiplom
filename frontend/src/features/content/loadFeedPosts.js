import * as contentApi from "./contentApi";
import { mapPostsWithAuthors } from "./mapPostsWithAuthors";

export async function loadFeedPostsFromApi(
  currentUserId,
  displayName,
  userAvatar,
  { page = 1, pageSize = 20, cacheBust = page === 1 } = {},
) {
  const paged = await contentApi.fetchFeedPosts({ page, pageSize, cacheBust });
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
