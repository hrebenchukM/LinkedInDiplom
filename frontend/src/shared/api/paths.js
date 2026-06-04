/** API route constants (must match Facade.API controllers). */
export const AUTH = {
  register: "/api/auth/register",
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  refresh: "/api/auth/refresh",
  me: "/api/auth/me",
  google: "/api/auth/google",
  facebook: "/api/auth/facebook",
};

export const PROFILE = {
  me: "/api/profile/me",
  avatar: "/api/profile/me/avatar",
  header: "/api/profile/me/header",
  byUserId: (userId) => `/api/profile/${encodeURIComponent(userId)}`,
};

export const CONTENT = {
  feed: "/api/content/feed",
  myPosts: "/api/content/me/posts",
  post: (postId) => `/api/content/posts/${postId}`,
  myPost: (postId) => `/api/content/me/posts/${postId}`,
  postComments: (postId) => `/api/content/posts/${postId}/comments`,
  postReactions: (postId) => `/api/content/posts/${postId}/reactions`,
  myPostReaction: (postId) => `/api/content/posts/${postId}/reactions/me`,
  mySavedPosts: "/api/content/me/saved-posts",
  savePost: (postId) => `/api/content/me/posts/${postId}/save`,
};

export const NETWORK = {
  myContacts: "/api/network/me/contacts",
  contact: (contactId) => `/api/network/me/contacts/${contactId}`,
  acceptContact: (contactId) => `/api/network/me/contacts/${contactId}/accept`,
  rejectContact: (contactId) => `/api/network/me/contacts/${contactId}/reject`,
  myFollowing: "/api/network/me/following",
  myFollowers: "/api/network/me/followers",
  following: (followingUserId) => `/api/network/me/following/${encodeURIComponent(followingUserId)}`,
};

export const MESSAGING = {
  myChats: "/api/messaging/me/chats",
  chat: (chatId) => `/api/messaging/me/chats/${chatId}`,
  chatMessages: (chatId) => `/api/messaging/me/chats/${chatId}/messages`,
  message: (messageId) => `/api/messaging/me/messages/${messageId}`,
};

export const JOBS = {
  vacancies: "/api/jobs/vacancies",
  vacancy: (vacancyId) => `/api/jobs/vacancies/${vacancyId}`,
  apply: (vacancyId) => `/api/jobs/me/vacancies/${vacancyId}/apply`,
  myApplications: "/api/jobs/me/applications",
  myFavorites: "/api/jobs/me/favorites",
  favorite: (vacancyId) => `/api/jobs/me/favorites/${vacancyId}`,
};

export const NOTIFICATIONS = {
  me: "/api/notifications/me",
  item: (id) => `/api/notifications/me/${id}`,
  markRead: (id) => `/api/notifications/me/${id}/read`,
  readAll: "/api/notifications/me/read-all",
};

export const PROFESSIONAL = {
  myExperiences: "/api/professional/me/experiences",
  myCompanies: "/api/professional/me/companies",
  company: (companyId) => `/api/professional/companies/${companyId}`,
  mySkills: "/api/professional/me/skills",
};
