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
  search: "/api/profile/search",
  byUserId: (userId) => `/api/profile/${encodeURIComponent(userId)}`,
  recordView: (userId) => `/api/profile/${encodeURIComponent(userId)}/views`,
  myProfileViews: "/api/profile/me/profile-views",
};

export const CONTENT = {
  feed: "/api/content/feed",
  userPosts: (userId) => `/api/content/users/${encodeURIComponent(userId)}/posts`,
  myPosts: "/api/content/me/posts",
  post: (postId) => `/api/content/posts/${postId}`,
  myPost: (postId) => `/api/content/me/posts/${postId}`,
  postMedia: (postId) => `/api/content/me/posts/${postId}/media`,
  uploadMedia: "/api/content/me/media/upload",
  postComments: (postId) => `/api/content/posts/${postId}/comments`,
  postReactions: (postId) => `/api/content/posts/${postId}/reactions`,
  myPostReaction: (postId) => `/api/content/posts/${postId}/reactions/me`,
  mySavedPosts: "/api/content/me/saved-posts",
  savePost: (postId) => `/api/content/me/posts/${postId}/save`,
  myReposts: "/api/content/me/reposts",
  repost: (postId) => `/api/content/me/posts/${postId}/repost`,
  postReposts: (postId) => `/api/content/posts/${postId}/reposts`,
  hashtags: "/api/content/hashtags",
  hashtag: (hashtagId) => `/api/content/hashtags/${hashtagId}`,
  postHashtags: (postId) => `/api/content/posts/${postId}/hashtags`,
  attachPostHashtag: (postId) => `/api/content/me/posts/${postId}/hashtags`,
  detachPostHashtag: (postId, hashtagId) =>
    `/api/content/me/posts/${postId}/hashtags/${encodeURIComponent(hashtagId)}`,
  followHashtag: (hashtagId) => `/api/content/me/hashtags/${encodeURIComponent(hashtagId)}/follow`,
  myHashtagFollowing: "/api/content/me/hashtags/following",
  postMentions: (postId) => `/api/content/posts/${postId}/mentions`,
  addPostMention: (postId) => `/api/content/me/posts/${postId}/mentions`,
  removePostMention: (postId, mentionedUserId) =>
    `/api/content/me/posts/${postId}/mentions/${encodeURIComponent(mentionedUserId)}`,
  recordPostView: (postId) => `/api/content/posts/${encodeURIComponent(postId)}/views`,
  myPostViews: (postId) => `/api/content/me/posts/${encodeURIComponent(postId)}/views`,
};

export const NETWORK = {
  myContacts: "/api/network/me/contacts",
  incomingContacts: "/api/network/me/contacts/incoming",
  outgoingContacts: "/api/network/me/contacts/outgoing",
  pendingContactCounts: "/api/network/me/contacts/pending-counts",
  contact: (contactId) => `/api/network/me/contacts/${contactId}`,
  acceptContact: (contactId) => `/api/network/me/contacts/${contactId}/accept`,
  rejectContact: (contactId) => `/api/network/me/contacts/${contactId}/reject`,
  myFollowing: "/api/network/me/following",
  myFollowers: "/api/network/me/followers",
  following: (followingUserId) => `/api/network/me/following/${encodeURIComponent(followingUserId)}`,
  myBlockedUsers: "/api/network/me/blocked-users",
  blockedUser: (blockedUserId) => `/api/network/me/blocked-users/${encodeURIComponent(blockedUserId)}`,
  myPages: "/api/network/me/pages",
  myFollowedPages: "/api/network/me/pages/following",
  page: (pageId) => `/api/network/me/pages/${encodeURIComponent(pageId)}`,
  pageFollow: (pageId) => `/api/network/me/pages/${encodeURIComponent(pageId)}/follow`,
  myGroups: "/api/network/me/groups",
  group: (groupId) => `/api/network/me/groups/${encodeURIComponent(groupId)}`,
  groupMembers: (groupId) => `/api/network/me/groups/${encodeURIComponent(groupId)}/members`,
  groupJoin: (groupId) => `/api/network/me/groups/${encodeURIComponent(groupId)}/join`,
};

export const MESSAGING = {
  myChats: "/api/messaging/me/chats",
  chat: (chatId) => `/api/messaging/me/chats/${chatId}`,
  chatMessages: (chatId) => `/api/messaging/me/chats/${chatId}/messages`,
  chatJoin: (chatId) => `/api/messaging/me/chats/${chatId}/join`,
  chatMembers: (chatId) => `/api/messaging/me/chats/${chatId}/members`,
  chatMembership: (chatId) => `/api/messaging/me/chats/${chatId}/membership`,
  message: (messageId) => `/api/messaging/me/messages/${messageId}`,
  messageRead: (messageId) => `/api/messaging/me/messages/${messageId}/read`,
  messageMediaUpload: (messageId) => `/api/messaging/me/messages/${messageId}/media/upload`,
};

export const ADMIN = {
  roles: "/api/admin/roles",
  users: "/api/admin/users",
  user: (userId) => `/api/admin/users/${encodeURIComponent(userId)}`,
  userRoles: (userId) => `/api/admin/users/${encodeURIComponent(userId)}/roles`,
  userRole: (userId, roleName) =>
    `/api/admin/users/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleName)}`,
  lockUser: (userId) => `/api/admin/users/${encodeURIComponent(userId)}/lock`,
  unlockUser: (userId) => `/api/admin/users/${encodeURIComponent(userId)}/unlock`,
  restoreUser: (userId) => `/api/admin/users/${encodeURIComponent(userId)}/restore`,
  statsOverview: "/api/admin/stats/overview",
  posts: "/api/admin/content/posts",
  post: (postId) => `/api/admin/content/posts/${postId}`,
  restorePost: (postId) => `/api/admin/content/posts/${postId}/restore`,
  comments: "/api/admin/content/comments",
  comment: (commentId) => `/api/admin/content/comments/${commentId}`,
  restoreComment: (commentId) => `/api/admin/content/comments/${commentId}/restore`,
  events: "/api/admin/events",
  event: (eventId) => `/api/admin/events/${eventId}`,
  restoreEvent: (eventId) => `/api/admin/events/${eventId}/restore`,
  vacancies: "/api/admin/jobs/vacancies",
  vacancy: (vacancyId) => `/api/admin/jobs/vacancies/${vacancyId}`,
  restoreVacancy: (vacancyId) => `/api/admin/jobs/vacancies/${vacancyId}/restore`,
  recommendedQueries: "/api/admin/jobs/recommended-queries",
  recommendedQuery: (id) => `/api/admin/jobs/recommended-queries/${id}`,
};

export const AI = {
  recommendedJobs: "/api/ai/recommended-jobs",
  careerAdvice: "/api/ai/career-advice",
};

export const JOBS = {
  vacancies: "/api/jobs/vacancies",
  vacancy: (vacancyId) => `/api/jobs/vacancies/${vacancyId}`,
  createVacancy: "/api/jobs/me/vacancies",
  myVacancy: (vacancyId) => `/api/jobs/me/vacancies/${encodeURIComponent(vacancyId)}`,
  apply: (vacancyId) => `/api/jobs/me/vacancies/${vacancyId}/apply`,
  myApplications: "/api/jobs/me/applications",
  myApplication: (applicationId) => `/api/jobs/me/applications/${encodeURIComponent(applicationId)}`,
  myFavorites: "/api/jobs/me/favorites",
  favorite: (vacancyId) => `/api/jobs/me/favorites/${vacancyId}`,
  recommendedQueries: "/api/jobs/recommended-queries",
  mySearchQueries: "/api/jobs/me/search-queries",
  mySearchQuery: (searchId) => `/api/jobs/me/search-queries/${encodeURIComponent(searchId)}`,
  mySearchQueryResults: (searchId) =>
    `/api/jobs/me/search-queries/${encodeURIComponent(searchId)}/results`,
};

export const EVENTS = {
  discover: "/api/events",
  attending: "/api/events/me/attending",
  my: "/api/events/me",
  create: "/api/events/me",
  item: (eventId) => `/api/events/${encodeURIComponent(eventId)}`,
  cover: (eventId) => `/api/events/me/${encodeURIComponent(eventId)}/cover`,
  join: (eventId) => `/api/events/me/${encodeURIComponent(eventId)}/join`,
  leave: (eventId) => `/api/events/me/${encodeURIComponent(eventId)}/attendance`,
};

export const NOTIFICATIONS = {
  me: "/api/notifications/me",
  item: (id) => `/api/notifications/me/${id}`,
  markRead: (id) => `/api/notifications/me/${id}/read`,
  readAll: "/api/notifications/me/read-all",
};

export const PROFESSIONAL = {
  myExperiences: "/api/professional/me/experiences",
  myExperience: (experienceId) =>
    `/api/professional/me/experiences/${encodeURIComponent(experienceId)}`,
  myEducations: "/api/professional/me/educations",
  myEducation: (educationId) =>
    `/api/professional/me/educations/${encodeURIComponent(educationId)}`,
  myCompanies: "/api/professional/me/companies",
  myCompany: (companyId) =>
    `/api/professional/me/companies/${encodeURIComponent(companyId)}`,
  company: (companyId) => `/api/professional/companies/${companyId}`,
  skills: "/api/professional/skills",
  skill: (skillId) => `/api/professional/skills/${skillId}`,
  recommendedSkills: "/api/professional/recommended-skills",
  mySkills: "/api/professional/me/skills",
  mySkill: (userSkillId) => `/api/professional/me/skills/${userSkillId}`,
  myCertificates: "/api/professional/me/certificates",
  myCertificate: (certificateId) =>
    `/api/professional/me/certificates/${encodeURIComponent(certificateId)}`,
  academies: "/api/professional/academies",
  academy: (academyId) => `/api/professional/academies/${encodeURIComponent(academyId)}`,
  languages: "/api/professional/languages",
  language: (languageId) => `/api/professional/languages/${encodeURIComponent(languageId)}`,
  myLanguages: "/api/professional/me/languages",
  myLanguage: (userLanguageId) =>
    `/api/professional/me/languages/${encodeURIComponent(userLanguageId)}`,
  userExperiences: (userId) => `/api/professional/users/${encodeURIComponent(userId)}/experiences`,
  userEducations: (userId) => `/api/professional/users/${encodeURIComponent(userId)}/educations`,
  userSkills: (userId) => `/api/professional/users/${encodeURIComponent(userId)}/skills`,
  userRecommendations: (userId) =>
    `/api/professional/users/${encodeURIComponent(userId)}/recommendations`,
  recommendations: "/api/professional/recommendations",
  recommendation: (recommendationId) =>
    `/api/professional/recommendations/${encodeURIComponent(recommendationId)}`,
};
