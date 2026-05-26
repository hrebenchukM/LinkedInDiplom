// 🟢 1. Identity Core + Profile Module

// Identity Core — авторизация, логин, роли, токены
Table AspNetUsers {
  user_id varchar [primary key] // в C# Identity это Id

  user_name varchar
  normalized_user_name varchar

  email varchar
  normalized_email varchar
  email_confirmed boolean

  password_hash varchar
  security_stamp varchar
  concurrency_stamp varchar

  phone varchar
  phone_confirmed boolean

  two_factor_enabled boolean
  lockout_end datetime
  lockout_enabled boolean
  access_failed_count int

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Table AspNetRoles {
  role_id varchar [primary key] // в C# Identity это Id

  name varchar
  normalized_name varchar
  concurrency_stamp varchar
}

Table AspNetUserRoles {
  user_id varchar
  role_id varchar
}

Ref: AspNetUserRoles.user_id > AspNetUsers.user_id
Ref: AspNetUserRoles.role_id > AspNetRoles.role_id

Table RefreshTokens {
  refresh_token_id int [primary key]

  token varchar
  user_id varchar

  created_at datetime
  expires_at datetime

  is_revoked boolean
  revoked_at datetime
  replaced_by_token varchar
}

Ref: RefreshTokens.user_id > AspNetUsers.user_id


// Profile Module — профиль пользователя
Table user_profiles {
  profile_id Guid [primary key]

  user_id varchar [unique] // Id пользователя из AspNetUsers

  first_name varchar
  last_name varchar

  avatar_url varchar
  header_url varchar

  profile_title varchar
  headline varchar
  gen_info text

  university varchar
  location varchar
  portfolio_url varchar

  is_company boolean

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: user_profiles.user_id > AspNetUsers.user_id


// Настройки сообщений пользователя
Table message_settings {
  ms_id Guid [primary key]

  user_id varchar

  office_absence_enabled boolean
  office_absence_message text
  notifications_enabled boolean

  created_at datetime
  updated_at datetime
}

Ref: message_settings.user_id > AspNetUsers.user_id


// Просмотры профиля
Table profile_views {
  pv_id Guid [primary key]

  profile_owner_id varchar
  viewer_user_id varchar

  viewer_ip varchar
  viewer_user_agent varchar
  source varchar

  viewed_at datetime
}

Ref: profile_views.profile_owner_id > AspNetUsers.user_id
Ref: profile_views.viewer_user_id > AspNetUsers.user_id


// Просмотры постов (not implemented in Content v3)
Table post_views {
  post_view_id Guid [primary key]

  post_id Guid
  viewer_user_id varchar

  viewer_ip varchar
  viewer_user_agent varchar
  source varchar

  viewed_at datetime
}

Ref: post_views.post_id > posts.post_id
Ref: post_views.viewer_user_id > AspNetUsers.user_id
//🟢 2. Профессиональная карьера (Companies, Experience, Education, Certificates)

Table companies {
  company_id Guid [primary key]

  owner_user_id varchar

  name varchar
  logo_url varchar
  industry varchar
  location varchar
  website_url varchar
  description text

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: companies.owner_user_id > AspNetUsers.user_id

Table experiences {
  experience_id Guid [primary key]

  user_id varchar
  company_id Guid

  position varchar
  employment_type varchar
  work_location_type varchar
  location varchar

  start_date date
  end_date date
  description text

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: experiences.user_id > AspNetUsers.user_id
Ref: experiences.company_id > companies.company_id

Table academies {
  academy_id Guid [primary key]

  name varchar
  logo_url varchar
  website_url varchar

  created_at datetime
  updated_at datetime
}

Table educations {
  education_id Guid [primary key]

  user_id varchar
  academy_id Guid

  institution varchar
  degree varchar
  field_of_study varchar
  start_date date
  end_date date
  source varchar

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: educations.user_id > AspNetUsers.user_id
Ref: educations.academy_id > academies.academy_id

Table certificates {
  certificate_id Guid [primary key]

  user_id varchar
  academy_id Guid

  name varchar
  download_ref varchar
  issue_date date
  expiry_date date
  accreditation_id varchar
  organization_url varchar

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: certificates.user_id > AspNetUsers.user_id
Ref: certificates.academy_id > academies.academy_id
//🟢 3. Skills & Languages & Recommendations

// Глобальный справочник навыков
Table skills {
  skill_id Guid [primary key]

  name varchar
  description varchar

  created_at datetime
  updated_at datetime
}

// Навыки конкретного пользователя
Table user_skills {
  user_skill_id Guid [primary key]

  user_id varchar
  skill_id Guid

  level varchar
  is_main boolean
  order_index int

  created_at datetime
  updated_at datetime
}

Ref: user_skills.user_id > AspNetUsers.user_id
Ref: user_skills.skill_id > skills.skill_id

// Связка сертификата с навыками
Table certificate_skills {
  certificate_skill_id Guid [primary key]

  certificate_id Guid
  skill_id Guid

  created_at datetime
}

Ref: certificate_skills.certificate_id > certificates.certificate_id
Ref: certificate_skills.skill_id > skills.skill_id

// Языки
Table languages {
  language_id Guid [primary key]

  name varchar

  created_at datetime
}

// Языки пользователя
Table user_languages {
  user_language_id Guid [primary key]

  user_id varchar
  language_id Guid

  level varchar

  created_at datetime
  updated_at datetime
}

Ref: user_languages.user_id > AspNetUsers.user_id
Ref: user_languages.language_id > languages.language_id

// Рекомендованные навыки по позиции
Table recommended_skills_by_position {
  rsp_id Guid [primary key]

  position varchar
  skill_id Guid

  created_at datetime
  updated_at datetime
}

Ref: recommended_skills_by_position.skill_id > skills.skill_id

// Recommendations
Table recommendations {
  recommendation_id Guid [primary key]

  author_id varchar
  user_id varchar

  text text

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: recommendations.author_id > AspNetUsers.user_id
Ref: recommendations.user_id > AspNetUsers.user_id
//🟢 4. Социальный граф (network): Connections, Follows, Groups, Pages

// Контакты
Table contacts {
  contact_id Guid [primary key]

  requester_id varchar
  receiver_id varchar

  status varchar

  requested_at datetime
  responded_at datetime
  status_changed_at datetime
}

Ref: contacts.requester_id > AspNetUsers.user_id
Ref: contacts.receiver_id > AspNetUsers.user_id

// Подписки
Table follows {
  follow_id Guid [primary key]

  follower_id varchar
  following_id varchar

  followed_at datetime
  unfollowed_at datetime
}

Ref: follows.follower_id > AspNetUsers.user_id
Ref: follows.following_id > AspNetUsers.user_id

// Блокировки
Table blocked_users {
  block_id Guid [primary key]

  user_id varchar
  blocked_user_id varchar

  blocked_at datetime
  unblocked_at datetime
}

Ref: blocked_users.user_id > AspNetUsers.user_id
Ref: blocked_users.blocked_user_id > AspNetUsers.user_id

// Groups
Table user_groups {
  group_id Guid [primary key]

  owner_id varchar

  name varchar
  description text
  avatar_url varchar

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: user_groups.owner_id > AspNetUsers.user_id

// Участники групп
Table group_members {
  group_member_id Guid [primary key]

  group_id Guid
  user_id varchar

  role varchar

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: group_members.group_id > user_groups.group_id
Ref: group_members.user_id > AspNetUsers.user_id

// Посты групп
Table group_posts {
  group_post_id Guid [primary key]

  group_id Guid
  post_id Guid

  created_at datetime
}

Ref: group_posts.group_id > user_groups.group_id
Ref: group_posts.post_id > posts.post_id

// Pages
Table pages {
  page_id Guid [primary key]

  owner_id varchar

  name varchar
  description text
  logo_url varchar

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: pages.owner_id > AspNetUsers.user_id

// Админы страниц
Table page_admins {
  page_admin_id Guid [primary key]

  page_id Guid
  user_id varchar

  role varchar

  assigned_at datetime
  revoked_at datetime
}

Ref: page_admins.page_id > pages.page_id
Ref: page_admins.user_id > AspNetUsers.user_id

// Подписчики страниц
Table page_followers {
  page_follower_id Guid [primary key]

  page_id Guid
  user_id varchar

  followed_at datetime
  unfollowed_at datetime
}

Ref: page_followers.page_id > pages.page_id
Ref: page_followers.user_id > AspNetUsers.user_id 
// 🟢 5. Контент: Posts / Media / Comments / Hashtags / Saved / Reposts
// PostgreSQL schema: content
//
// Implementation status (Content module, .NET 8):
//   v1 — posts, media, post_media          (migration AddContentModule)
//   v2 — comments, reactions                (migration AddContentCommentsAndReactions)
//   v3 — hashtags, post_hashtags, user_hashtag_follows (migration AddContentHashtagsAndFollows)
//   not implemented — saved_posts, reposts, post_views (see above), mentions, group_posts (Network)
//
// EF: no FK to AspNetUsers; user_id stored as string. Hashtag name unique (normalized trim+lower in service).

Table posts {
  post_id Guid [primary key]

  user_id varchar

  content text
  visibility varchar

  reaction_count int
  comment_count int
  repost_count int

  created_at datetime
  edited_at datetime
  deleted_at datetime
}

Ref: posts.user_id > AspNetUsers.user_id

// Медиа
Table media {
  media_id Guid [primary key]

  url varchar
  type varchar

  created_at datetime
}

// Медиа постов
Table post_media {
  post_media_id Guid [primary key]

  post_id Guid
  media_id Guid

  created_at datetime
}

Ref: post_media.post_id > posts.post_id
Ref: post_media.media_id > media.media_id

// Реакции
Table reactions {
  reaction_id Guid [primary key]

  user_id varchar
  post_id Guid

  reaction_type varchar

  created_at datetime
}

Ref: reactions.user_id > AspNetUsers.user_id
Ref: reactions.post_id > posts.post_id

// Комментарии
Table comments {
  comment_id Guid [primary key]

  post_id Guid
  user_id varchar
  parent_comment_id Guid

  content text

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: comments.post_id > posts.post_id
Ref: comments.user_id > AspNetUsers.user_id
Ref: comments.parent_comment_id > comments.comment_id

// Хэштеги (v3 — implemented)
Table hashtags {
  hashtag_id Guid [primary key]

  name varchar [unique, note: 'max 100; normalized trim+lower in service']

  created_at datetime
  updated_at datetime
}

// Хэштеги постов (v3 — implemented)
Table post_hashtags {
  post_hashtag_id Guid [primary key]

  post_id Guid
  hashtag_id Guid

  created_at datetime

  indexes {
    (post_id, hashtag_id) [unique]
  }
}

Ref: post_hashtags.post_id > posts.post_id
Ref: post_hashtags.hashtag_id > hashtags.hashtag_id

// Подписки на хэштеги (v3 — implemented; soft unfollow via unfollowed_at)
Table user_hashtag_follows {
  follow_id Guid [primary key]

  user_id varchar
  hashtag_id Guid

  followed_at datetime
  unfollowed_at datetime

  indexes {
    (user_id, hashtag_id) [unique]
  }
}

Ref: user_hashtag_follows.user_id > AspNetUsers.user_id
Ref: user_hashtag_follows.hashtag_id > hashtags.hashtag_id

// Сохранённые посты (not implemented in Content v3)
Table saved_posts {
  saved_post_id Guid [primary key]

  user_id varchar
  post_id Guid

  saved_at datetime
  unsaved_at datetime
}

Ref: saved_posts.user_id > AspNetUsers.user_id
Ref: saved_posts.post_id > posts.post_id

// Репосты
Table reposts {
  repost_id Guid [primary key]

  user_id varchar
  original_post_id Guid

  reposted_at datetime
  removed_at datetime
}

Ref: reposts.user_id > AspNetUsers.user_id
Ref: reposts.original_post_id > posts.post_id

// 🟢 6. Messaging (Chats, Messages, Read receipts)

Table chats {
  chat_id Guid [primary key]

  created_by varchar

  created_at datetime
  deleted_at datetime
}

Ref: chats.created_by > AspNetUsers.user_id

// Участники чата
Table chat_members {
  chat_member_id Guid [primary key]

  chat_id Guid
  user_id varchar

  folder varchar
  status varchar

  is_favorite boolean
  has_unread boolean

  joined_at datetime
  updated_at datetime
  left_at datetime
}

Ref: chat_members.chat_id > chats.chat_id
Ref: chat_members.user_id > AspNetUsers.user_id

// Сообщения
Table messages {
  message_id Guid [primary key]

  chat_id Guid
  sender_id varchar

  content text

  sent_at datetime
  edited_at datetime
  deleted_at datetime

  is_draft boolean
}

Ref: messages.chat_id > chats.chat_id
Ref: messages.sender_id > AspNetUsers.user_id

// Прочтение сообщений
Table message_reads {
  message_read_id Guid [primary key]

  message_id Guid
  user_id varchar

  read_at datetime
}

Ref: message_reads.message_id > messages.message_id
Ref: message_reads.user_id > AspNetUsers.user_id

// Медиа сообщений
Table message_media {
  message_media_id Guid [primary key]

  message_id Guid
  media_id Guid

  created_at datetime
}

Ref: message_media.message_id > messages.message_id
Ref: message_media.media_id > media.media_id

// 🟢 7. Jobs (Vacancies, Applications, Job search)

Table vacancies {
  vacancy_id Guid [primary key]

  company_id Guid
  posted_by varchar

  title varchar
  job_type varchar
  schedule varchar
  location varchar

  salary_from int
  salary_to int
  salary_currency varchar

  description text

  posted_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: vacancies.company_id > companies.company_id
Ref: vacancies.posted_by > AspNetUsers.user_id

// Избранные вакансии
Table user_vacancies_favorites {
  uvf_id Guid [primary key]

  user_id varchar
  vacancy_id Guid

  created_at datetime
  deleted_at datetime
}

Ref: user_vacancies_favorites.user_id > AspNetUsers.user_id
Ref: user_vacancies_favorites.vacancy_id > vacancies.vacancy_id

// Отклики
Table job_applications {
  job_application_id Guid [primary key]

  vacancy_id Guid
  user_id varchar

  status varchar

  applied_at datetime
  status_changed_at datetime
  withdrawn_at datetime
}

Ref: job_applications.vacancy_id > vacancies.vacancy_id
Ref: job_applications.user_id > AspNetUsers.user_id

// История поисков
Table job_search_queries {
  job_search_id Guid [primary key]

  user_id varchar

  query varchar
  location varchar
  radius int

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: job_search_queries.user_id > AspNetUsers.user_id

// Результаты поисков
Table job_search_results {
  job_search_result_id Guid [primary key]

  search_id Guid
  vacancy_id Guid

  order_index int

  created_at datetime
  deleted_at datetime
}

Ref: job_search_results.search_id > job_search_queries.job_search_id
Ref: job_search_results.vacancy_id > vacancies.vacancy_id

// Рекомендованные запросы
Table recommended_job_queries {
  recommended_job_query_id Guid [primary key]

  query varchar

  created_at datetime
}
// 🟢 8. Notifications + Mentions

Table notifications {
  notification_id Guid [primary key]

  user_id varchar
  actor_user_id varchar

  type varchar
  title varchar
  body text

  entity_type varchar
  entity_id Guid

  is_read boolean

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: notifications.user_id > AspNetUsers.user_id
Ref: notifications.actor_user_id > AspNetUsers.user_id

// Audit / Activity log
Table user_activity {
  activity_id Guid [primary key]

  user_id varchar

  action varchar
  entity_type varchar
  entity_id Guid

  meta json

  created_at datetime
}

Ref: user_activity.user_id > AspNetUsers.user_id

// Mentions
Table mentions {
  mention_id Guid [primary key]

  post_id Guid
  mentioned_user_id varchar

  created_at datetime
  deleted_at datetime
}

Ref: mentions.post_id > posts.post_id
Ref: mentions.mentioned_user_id > AspNetUsers.user_id
// 🟢 9. Events (Network → Events)

Table events {
  event_id Guid [primary key]

  organizer_type varchar
  organizer_id varchar

  title varchar
  description text

  cover_image_url varchar
  location varchar

  is_online boolean
  external_link varchar
  timezone varchar

  visibility varchar
  allow_comments boolean

  start_at datetime
  end_at datetime

  created_at datetime
  updated_at datetime
  deleted_at datetime
}

// Участники событий
Table event_attendees {
  event_attendee_id Guid [primary key]

  event_id Guid
  user_id varchar

  status varchar

  joined_at datetime
  updated_at datetime
  deleted_at datetime
}

Ref: event_attendees.event_id > events.event_id
Ref: event_attendees.user_id > AspNetUsers.user_id

// Расписание события
Table event_schedule {
  schedule_id Guid [primary key]

  event_id Guid

  time_label varchar
  title varchar
  speaker_name varchar

  order_index int

  created_at datetime
}

Ref: event_schedule.event_id > events.event_id

// Спикеры
Table event_speakers {
  speaker_id Guid [primary key]

  name varchar
  title varchar
  avatar_url varchar

  created_at datetime
}

// Связь события и спикеров
Table event_speaker_map {
  event_speaker_map_id Guid [primary key]

  event_id Guid
  speaker_id Guid

  order_index int
}

Ref: event_speaker_map.event_id > events.event_id
Ref: event_speaker_map.speaker_id > event_speakers.speaker_id