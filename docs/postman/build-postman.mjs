/**
 * Transforms and updates LinkedInDiplom Postman collection + environment.
 * Run: node docs/postman/build-postman.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COLLECTION_PATH = path.join(__dirname, 'LinkedInDiplom.postman_collection.json');
const ENV_PATH = path.join(__dirname, 'LinkedInDiplom.local.postman_environment.json');

// --- shared Postman test scripts ---
const SAVE_USER_TOKEN = [
  "pm.test('Status 200/201 or expected auth error', () => pm.expect([200, 201, 400, 401]).to.include(pm.response.code));",
  'try {',
  '  const j = pm.response.json();',
  '  const access = j?.token?.accessToken;',
  '  const refresh = j?.token?.refreshToken;',
  '  const uid = j?.account?.id;',
  '  if (access) {',
  '    pm.environment.set("accessToken", access);',
  '    pm.environment.set("token", access);',
  '    console.log("accessToken saved");',
  '  }',
  '  if (refresh) { pm.environment.set("refreshToken", refresh); console.log("refreshToken saved"); }',
  '  if (uid) {',
  '    pm.environment.set("userId", uid);',
  '    pm.environment.set("userAId", uid);',
  '    console.log("userId saved:", uid);',
  '  }',
  '} catch (e) { /* non-json */ }',
];

const SAVE_ADMIN_TOKEN = [
  "pm.test('Status 200/201', () => pm.expect([200, 201]).to.include(pm.response.code));",
  'try {',
  '  const j = pm.response.json();',
  '  const access = j?.token?.accessToken;',
  '  const uid = j?.account?.id;',
  '  if (access) {',
  '    pm.environment.set("adminAccessToken", access);',
  '    pm.environment.set("adminToken", access);',
  '    console.log("adminToken saved");',
  '  }',
  '  if (uid) { pm.environment.set("adminUserId", uid); console.log("adminUserId saved:", uid); }',
  '} catch (e) {}',
];

const SAVE_REFRESH = [
  "pm.test('Status 200 or 401', () => pm.expect([200, 401]).to.include(pm.response.code));",
  'if (pm.response.code === 200) {',
  '  try {',
  '    const j = pm.response.json();',
  '    const access = j?.token?.accessToken;',
  '    const refresh = j?.token?.refreshToken;',
  '    if (access) { pm.environment.set("accessToken", access); console.log("accessToken refreshed"); }',
  '    if (refresh) { pm.environment.set("refreshToken", refresh); }',
  '  } catch (e) {}',
  '}',
];

const SAVE_REGISTER_USER = [
  "pm.test('Status 200 or 400', () => pm.expect([200, 400]).to.include(pm.response.code));",
  'try {',
  '  const j = pm.response.json();',
  '  const uid = j?.account?.id;',
  '  if (uid) { pm.environment.set("userId", uid); console.log("userId saved:", uid); }',
  '} catch (e) {}',
];

const SAVE_OTHER_USER_ID = [
  "pm.test('Status 200 or 401', () => pm.expect([200, 401]).to.include(pm.response.code));",
  'if (pm.response.code === 200) {',
  '  try {',
  '    const j = pm.response.json();',
  '    const uid = j?.account?.id;',
  '    if (uid) {',
  '      pm.environment.set("otherUserId", uid);',
  '      pm.environment.set("userBId", uid);',
  '      pm.environment.set("participantUserId", uid);',
  '      console.log("userBId saved:", uid);',
  '    }',
  '  } catch (e) {}',
  '}',
];

const SAVE_NOTIFICATION_ID_FROM_LIST = [
  "pm.test('Status 200', () => pm.expect(pm.response.code).to.eql(200));",
  'try {',
  '  const j = pm.response.json();',
  '  const items = j?.items || j?.Items || [];',
  '  const first = items[0];',
  '  const id = first?.id || first?.Id;',
  '  if (id) { pm.environment.set("notificationId", String(id)); console.log("notificationId saved:", id); }',
  '} catch (e) {}',
];

const SAVE_RECOMMENDED_QUERY_ID = [
  'if (pm.response.code >= 200 && pm.response.code < 300) {',
  '  try {',
  '    const j = pm.response.json();',
  '    const id = j?.id || j?.Id || j?.recommendedJobQuery?.id;',
  '    if (id) {',
  '      pm.environment.set("recommendedQueryId", String(id));',
  '      pm.environment.set("recommendedJobQueryId", String(id));',
  '      console.log("recommendedQueryId saved:", id);',
  '    }',
  '  } catch (e) {}',
  '}',
];

const AI_RESPONSE_TEST = [
  "pm.test('Status 200 or 503', () => pm.expect([200, 503]).to.include(pm.response.code));",
  'if (pm.response.code === 503) {',
  '  try {',
  '    const j = pm.response.json();',
  '    pm.expect(j.success).to.eql(false);',
  '  } catch (e) {}',
  '}',
];

function saveIdTest(envVar, ...entityKeys) {
  const parts = entityKeys.map((k) => `j?.${k}?.id`).join(' || ');
  return [
    'if (pm.response.code >= 200 && pm.response.code < 300) {',
    '  try {',
    '    const j = pm.response.json();',
    `    const id = ${parts}${parts ? ' || ' : ''}j?.id;`,
    `    if (id) { pm.environment.set("${envVar}", String(id)); console.log("${envVar} saved:", id); }`,
    '  } catch (e) {}',
    '}',
  ];
}

function testEvent(lines) {
  return [{ listen: 'test', script: { type: 'text/javascript', exec: lines } }];
}

function bearer(token = '{{accessToken}}') {
  return { type: 'bearer', bearer: [{ key: 'token', value: token, type: 'string' }] };
}

function jsonBody(raw) {
  return {
    mode: 'raw',
    raw,
    options: { raw: { language: 'json' } },
  };
}

function formFileUpload() {
  return {
    mode: 'formdata',
    formdata: [{ key: 'file', type: 'file', src: '', description: 'Select jpg/png/webp (max 5MB) or pdf for certificates (max 10MB)' }],
  };
}

function req(name, method, urlPath, opts = {}) {
  const item = {
    name,
    request: {
      method,
      header: opts.headers || [],
      url: opts.url || `{{baseUrl}}${urlPath}`,
      description: opts.description || '',
    },
  };
  if (opts.auth !== undefined) item.request.auth = opts.auth;
  else if (opts.noAuth) item.request.auth = { type: 'noauth' };
  if (opts.body) item.request.body = opts.body;
  if (opts.headers?.length === 0 && opts.body?.mode === 'raw') {
    item.request.header.push({ key: 'Content-Type', value: 'application/json' });
  }
  if (opts.tests) item.event = testEvent(opts.tests);
  return item;
}

function folder(name, items, auth) {
  const f = { name, item: items };
  if (auth) f.auth = auth;
  return f;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function findRequest(folderItems, name) {
  for (const it of folderItems) {
    if (it.name === name && it.request) return it;
    if (it.item) {
      const found = findRequest(it.item, name);
      if (found) return found;
    }
  }
  return null;
}

function insertAfter(folderItems, afterName, newReq) {
  if (findRequest(folderItems, newReq.name)) return;
  const idx = folderItems.findIndex((x) => x.name === afterName);
  if (idx >= 0) folderItems.splice(idx + 1, 0, newReq);
  else folderItems.push(newReq);
}

/** Resolve folder after renames; script is idempotent across multiple runs. */
function folderByName(...names) {
  for (const n of names) {
    if (byName[n]) return byName[n];
  }
  return null;
}

function patchAuthAdmin(items) {
  for (const it of items) {
    if (it.auth?.bearer?.[0]) {
      it.auth.bearer[0].value = '{{adminAccessToken}}';
    }
    if (it.item) patchAuthAdmin(it.item);
  }
}

function addTestsToCreateRequests(folderItems, map) {
  for (const it of folderItems) {
    if (it.item) addTestsToCreateRequests(it.item, map);
    if (!it.request) continue;
    const tests = map[it.name];
    if (tests && !it.event) it.event = testEvent(tests);
  }
}

// --- load existing ---
const col = JSON.parse(fs.readFileSync(COLLECTION_PATH, 'utf8'));
const byName = Object.fromEntries(col.item.map((f) => [f.name, f]));

// patch auth scripts on auth folder
const authFolder = byName['01 Auth / Account'];
if (authFolder) {
  for (const r of authFolder.item) {
    if (r.name === 'Login' || r.name === 'Login User A') {
      r.name = 'Login User A';
      r.request.body = jsonBody('{\n  "email": "{{userAEmail}}",\n  "password": "{{userAPassword}}"\n}');
      r.request.description =
        'Demo User A (default test@example.com / Test123! from DemoSeed). Saves accessToken, token, refreshToken, userId, userAId.';
      r.event = testEvent(SAVE_USER_TOKEN);
    }
    if (r.name === 'Register') r.event = testEvent(SAVE_REGISTER_USER);
    if (r.name === 'Refresh Token') r.event = testEvent(SAVE_REFRESH);
    if (r.name === 'Get Current User') {
      r.request.description = 'GET /api/auth/me — current account from JWT.';
    }
  }
  if (!findRequest(authFolder.item, 'Login Demo User (Marya)')) {
    authFolder.item.splice(2, 0, req('Login Demo User (Marya)', 'POST', '/api/auth/login', {
      body: jsonBody('{\n  "email": "marya101204@gmail.com",\n  "password": "Mgg101204"\n}'),
      description: 'Primary showcase user from demo seed. Password from DemoSeed:PrimaryDemoUserPassword (default Mgg101204).',
      tests: SAVE_USER_TOKEN,
    }));
  }
  const loginBOther = findRequest(authFolder.item, 'Login Other User (resolve otherUserId)')
    || findRequest(authFolder.item, 'Login User B (resolve userBId)');
  if (loginBOther) {
    loginBOther.name = 'Login User B (resolve userBId)';
    loginBOther.request.body = jsonBody('{\n  "email": "{{userBEmail}}",\n  "password": "{{userBPassword}}"\n}');
    loginBOther.request.description =
      'Demo User B (default test2@example.com). Saves userBId, otherUserId, participantUserId — does **not** overwrite accessToken. Run after Login User A.';
    loginBOther.event = testEvent(SAVE_OTHER_USER_ID);
  } else {
    const loginIdx = authFolder.item.findIndex((x) => x.name === 'Login User A' || x.name === 'Login');
    authFolder.item.splice(loginIdx + 1, 0, req('Login User B (resolve userBId)', 'POST', '/api/auth/login', {
      body: jsonBody('{\n  "email": "{{userBEmail}}",\n  "password": "{{userBPassword}}"\n}'),
      description: 'Demo User B. Saves userBId only — does not overwrite accessToken.',
      tests: SAVE_OTHER_USER_ID,
    }));
  }
  if (!findRequest(authFolder.item, 'Login Admin')) {
    authFolder.item.push(
      req('Login Admin', 'POST', '/api/auth/login', {
        body: jsonBody('{\n  "email": "{{adminEmail}}",\n  "password": "{{adminPassword}}"\n}'),
        description: 'Platform admin (AdminSeed: admin@local.dev / Admin123!). Saves adminToken, adminAccessToken, adminUserId.',
        tests: SAVE_ADMIN_TOKEN,
      }),
    );
  }
}

// patch profile - add DELETE avatar/header
const profileFolder = byName['02 Profile'];
if (profileFolder) {
  profileFolder.auth = bearer();
  if (!findRequest(profileFolder.item, 'Delete Avatar')) {
    const idx = profileFolder.item.findIndex((x) => x.name === 'Upload Header');
    const deletes = [
      req('Delete Avatar', 'DELETE', '/api/profile/me/avatar', {
        description: 'Removes avatar URL and deletes file from storage (best-effort).',
      }),
      req('Delete Header', 'DELETE', '/api/profile/me/header', {
        description: 'Removes header URL and deletes file from storage (best-effort).',
      }),
    ];
    profileFolder.item.splice(idx + 1, 0, ...deletes);
  }
  for (const r of profileFolder.item) {
    if (r.name === 'Upload Avatar' || r.name === 'Upload Header') {
      r.request.body = formFileUpload();
      r.request.description =
        'multipart/form-data, field `file`. Allowed: jpg/jpeg/png/webp, max 5MB. Returns ProfileResponse with avatarUrl/headerUrl.';
    }
  }
}

// add save-id scripts to create requests
const idMap = {
  'Create Vacancy': saveIdTest('vacancyId', 'vacancy'),
  'Create Chat': saveIdTest('chatId', 'chat'),
  'Create Direct Chat (participantUserId)': saveIdTest('chatId', 'chat'),
  'Send Message': saveIdTest('messageId', 'message'),
  'Create Comment': saveIdTest('commentId', 'comment'),
  'Create Experience': saveIdTest('experienceId', 'experience'),
  'Create Company': saveIdTest('companyId', 'company'),
  'Create Education': saveIdTest('educationId', 'education'),
  'Create Certificate': saveIdTest('certificateId', 'certificate'),
  'Create My Skill': saveIdTest('userSkillId', 'userSkill'),
  'Create Academy (Admin)': saveIdTest('academyId', 'academy'),
  'Create Skill (Admin)': saveIdTest('skillId', 'skill'),
  'Create Language (Admin)': saveIdTest('languageId', 'language'),
  'Create Contact': saveIdTest('contactId', 'contact'),
  'Create Group': saveIdTest('groupId', 'userGroup'),
  'Create Page': saveIdTest('pageId', 'page'),
  'Create Event': saveIdTest('eventId', 'event'),
  'Apply To Vacancy': saveIdTest('applicationId', 'application'),
  'Upload Content Media': saveIdTest('mediaId', 'media'),
  'Create Hashtag (Admin)': saveIdTest('hashtagId', 'hashtag'),
};

for (const f of Object.values(byName)) {
  if (f.item) addTestsToCreateRequests(f.item, idMap);
}

// jobs - withdraw + minSalaryFrom + save vacancy id
const jobsFolder = folderByName('08 Jobs', '06 Jobs');
if (jobsFolder) {
  const withdraw = findRequest(jobsFolder.item, 'Delete Application')
    || findRequest(jobsFolder.item, 'Withdraw Application');
  if (withdraw) {
    withdraw.name = 'Withdraw Application';
    withdraw.request.description =
      'DELETE /api/jobs/me/applications/{applicationId}. Soft-withdraw; frontend allows re-apply after withdraw.';
  }
  if (!findRequest(jobsFolder.item, 'Get Vacancies (minSalaryFrom)')) {
    const pagedIdx = jobsFolder.item.findIndex((x) => x.name === 'Get Vacancies (paged)');
    jobsFolder.item.splice(pagedIdx + 1, 0, req('Get Vacancies (minSalaryFrom)', 'GET', '/api/jobs/vacancies?minSalaryFrom=80000&page=1&pageSize=20', {
      description: 'Filter vacancies with salaryFrom >= minSalaryFrom. Requires JWT.',
    }));
  }
  const createVac = findRequest(jobsFolder.item, 'Create Vacancy');
  if (createVac && !createVac.event) createVac.event = testEvent(saveIdTest('vacancyId', 'vacancy'));
}

// notifications — save first notificationId from list
const notifFolder = folderByName('07 Notifications', '09 Notifications');
if (notifFolder) {
  notifFolder.auth = bearer();
  const getNotif = findRequest(notifFolder.item, 'Get My Notifications');
  if (getNotif) {
    getNotif.event = testEvent(SAVE_NOTIFICATION_ID_FROM_LIST);
    getNotif.request.description =
      'PagedResponse<NotificationDto>. Saves first notificationId to environment. Realtime: /hubs/notifications (NotificationCreated).';
  }
  if (!findRequest(notifFolder.item, 'Get Unread Count (pageSize=1)')) {
    insertAfter(
      notifFolder.item,
      'Get My Notifications (unread)',
      req('Get Unread Count (pageSize=1)', 'GET', '/api/notifications/me?isRead=false&pageSize=1', {
        description: 'Quick unread check (first page, one item).',
      }),
    );
  }
}

// admin folder patches
const adminFolder = folderByName('11 Admin', '10 Admin');
if (adminFolder) {
  adminFolder.name = '11 Admin';
  const adminLogin = findRequest(adminFolder.item, 'Admin Login');
  if (adminLogin) adminLogin.event = testEvent(SAVE_ADMIN_TOKEN);
  const adminApi = adminFolder.item.find((x) => x.name === 'Admin API');
  if (adminApi) {
    adminApi.auth = bearer('{{adminAccessToken}}');
    patchAuthAdmin(adminApi.item);
    const createRq = findRequest(adminApi.item, 'Create Recommended Query');
    if (createRq) {
      createRq.request.body = jsonBody('{\n  "query": "React developer"\n}');
      createRq.event = testEvent(SAVE_RECOMMENDED_QUERY_ID);
    }
    const deleteRq = findRequest(adminApi.item, 'Delete Recommended Query');
    if (deleteRq) {
      deleteRq.request.url = '{{baseUrl}}/api/admin/jobs/recommended-queries/{{recommendedQueryId}}';
      deleteRq.request.description = 'Uses recommendedQueryId (alias: recommendedJobQueryId).';
    }
  }
}

// rename other folders to user structure
const renames = {
  '05 Content': '03 Content',
  '04 Network': '04 Network',
  '06 Messaging': '05 Messaging',
  '07 Jobs': '06 Jobs',
  '09 Events': '07 Events',
  '03 Professional': '08 Professional',
  '08 Notifications': '09 Notifications',
  '12 Validation / Negative cases': '99 Error Examples / Validation',
  '11 AI': '99 Debug / Utility / AI',
};

for (const [oldName, newName] of Object.entries(renames)) {
  if (byName[oldName]) byName[oldName].name = newName;
}

// professional — public portfolio reads (certificates, languages)
const profFolder = folderByName('08 Professional', '03 Professional');
if (profFolder?.item) {
  insertAfter(
    profFolder.item,
    'Get User Skills (public)',
    req('Get User Certificates (public)', 'GET', '/api/professional/users/{{otherUserId}}/certificates', {
      noAuth: true,
      description:
        'Public portfolio section. No JWT. Uses otherUserId (run Auth → Login Other User first). ' +
        '404 if profile not found.',
      tests: ["pm.test('Status 200 or 404', () => pm.expect([200, 404]).to.include(pm.response.code));"],
    })
  );
  insertAfter(
    profFolder.item,
    'Get User Certificates (public)',
    req('Get User Languages (public)', 'GET', '/api/professional/users/{{otherUserId}}/languages', {
      noAuth: true,
      description: 'Public portfolio section. No JWT. Array of UserLanguageDto.',
      tests: ["pm.test('Status 200 or 404', () => pm.expect([200, 404]).to.include(pm.response.code));"],
    })
  );
}

// messaging — direct chat with participantUserId
const msgFolder = folderByName('05 Messaging', '06 Messaging');
if (msgFolder?.item) {
  const createChat = findRequest(msgFolder.item, 'Create Chat');
  if (createChat) {
    createChat.request.description =
      'Creates chat for current user only. Empty body `{}` — backward compatible (creator is sole member).';
  }
  insertAfter(
    msgFolder.item,
    'Create Chat',
    req('Create Direct Chat (participantUserId)', 'POST', '/api/messaging/me/chats', {
      body: jsonBody('{\n  "participantUserId": "{{userBId}}"\n}'),
      description:
        'Direct messaging User A → User B: run Login User B first to set userBId. ' +
        'Facade auto-joins participant. Saves chatId. Realtime: /hubs/messaging after JoinChat.',
      tests: saveIdTest('chatId', 'chat'),
    })
  );
}

// AI folder — rename and accept 200 or 503
const aiFolder = folderByName('10 AI', '99 Debug / Utility / AI', '11 AI');
if (aiFolder) {
  aiFolder.name = '10 AI';
  for (const r of aiFolder.item) {
    if (r.name === 'Get Recommended Jobs' || r.name === 'Get Career Advice') {
      r.request.description =
        (r.name === 'Get Recommended Jobs'
          ? 'GET /api/ai/recommended-jobs (Gemini or skill fallback). Frontend wired. '
          : 'GET /api/ai/career-advice (Gemini). **Backend-ready; frontend not wired yet.** ') +
        'Requires JWT. Expect **200** or **503** when AI unavailable.';
      r.event = testEvent(AI_RESPONSE_TEST);
    }
  }
}

// folder numbering — Professional before Content (collision-safe via temp name)
function setFolderName(folder, newName) {
  if (!folder) return;
  const old = folder.name;
  folder.name = newName;
  if (byName[old] === folder) delete byName[old];
  byName[newName] = folder;
}

const profF = folderByName('08 Professional', '03 Professional');
const contentF = folderByName('03 Content', '04 Content');
const networkF = folderByName('04 Network', '05 Network');
const msgF2 = folderByName('05 Messaging', '06 Messaging');
const notifF2 = folderByName('09 Notifications', '07 Notifications');
const jobsF2 = folderByName('06 Jobs', '08 Jobs');
const eventsF = folderByName('07 Events', '09 Events');

if (profF) setFolderName(profF, '_TMP_Professional');
if (contentF) setFolderName(contentF, '04 Content');
if (networkF) setFolderName(networkF, '05 Network');
if (msgF2) setFolderName(msgF2, '06 Messaging');
if (notifF2) setFolderName(notifF2, '07 Notifications');
if (jobsF2) setFolderName(jobsF2, '08 Jobs');
if (eventsF) setFolderName(eventsF, '09 Events');
const profTmp = folderByName('_TMP_Professional');
if (profTmp) setFolderName(profTmp, '03 Professional');

// content — repost/mentions/hashtags descriptions
const contentFolder = folderByName('04 Content', '03 Content');
if (contentFolder) {
  contentFolder.auth = bearer();
  const repost = findRequest(contentFolder.item, 'Repost Post') || findRequest(contentFolder.item, 'Create Repost');
  if (repost) {
    repost.request.description = 'POST /api/content/me/posts/{postId}/repost. Frontend API wired; Home UI partial.';
  }
}

// --- new folders ---
const healthFolder = folder('00 Health / Swagger / Base', [
  req('Swagger JSON (health check)', 'GET', '/swagger/v1/swagger.json', {
    noAuth: true,
    description: 'Quick check that API is running. Expect 200 in Development.',
    tests: ["pm.test('API is up', () => pm.expect(pm.response.code).to.eql(200));"],
  }),
  req('Get Feed (public, no auth)', 'GET', '/api/content/feed?page=1&pageSize=5', {
    noAuth: true,
    description: 'Public feed without JWT — smoke test without login.',
  }),
]);

const uploadDefs = [
  ['Profile Avatar', 'POST', '/api/profile/me/avatar', '{{accessToken}}', 'jpg/jpeg/png/webp, max 5MB'],
  ['Profile Header', 'POST', '/api/profile/me/header', '{{accessToken}}', 'jpg/jpeg/png/webp, max 5MB'],
  ['Content Media', 'POST', '/api/content/me/media/upload', '{{accessToken}}', 'images, max 10MB; creates Media row'],
  ['Company Logo', 'POST', '/api/professional/me/companies/{{companyId}}/logo', '{{accessToken}}', 'requires companyId'],
  ['Academy Logo (Admin)', 'POST', '/api/professional/academies/{{academyId}}/logo', '{{adminAccessToken}}', 'Admin only'],
  ['Certificate File', 'POST', '/api/professional/me/certificates/{{certificateId}}/file', '{{accessToken}}', 'pdf/images, max 10MB'],
  ['Page Logo', 'POST', '/api/network/me/pages/{{pageId}}/logo', '{{accessToken}}', 'requires pageId'],
  ['Group Avatar', 'POST', '/api/network/me/groups/{{groupId}}/avatar', '{{accessToken}}', 'requires groupId'],
  ['Event Cover', 'POST', '/api/events/me/{{eventId}}/cover', '{{accessToken}}', 'requires eventId'],
  ['Speaker Avatar (Admin)', 'POST', '/api/events/me/speakers/{{speakerId}}/avatar', '{{adminAccessToken}}', 'Admin only'],
  ['Message Media', 'POST', '/api/messaging/me/messages/{{messageId}}/media/upload', '{{accessToken}}', 'requires messageId, max 10MB'],
];

const uploadsFolder = folder(
  '12 File Uploads',
  uploadDefs.map(([name, method, urlPath, token, note]) =>
    req(name, method, urlPath, {
      auth: bearer(token),
      body: formFileUpload(),
      description: `form-data field \`file\` (type File — select manually in Postman). ${note}. Returns URL in response DTO.`,
    })
  ),
  bearer()
);

const signalrFolder = folder('13 SignalR Info (not HTTP REST)', [
  req('Messaging Hub — README', 'GET', '/swagger/index.html', {
    noAuth: true,
    description:
      '**Swagger does not test SignalR.** Use frontend (two browsers) or frontend/scripts/verify-signalr.mjs.\n\n' +
      'Hub: {{baseUrl}}/hubs/messaging?access_token={{accessToken}}\n' +
      'Group: chat:{chatId} (after JoinChat)\n' +
      'Server events: MessageCreated, MessageUpdated, MessageDeleted, MessageRead, MessageMediaAttached\n\n' +
      'Flow: POST message via REST → DB → hub push to group.\n' +
      'See docs/07_REALTIME_AND_DOMAIN_EVENTS.md',
  }),
  req('Notifications Hub — README', 'GET', '/swagger/index.html', {
    noAuth: true,
    description:
      'Hub: {{baseUrl}}/hubs/notifications?access_token={{accessToken}}\n' +
      'Group: user:{userId} (auto-join from JWT on connect)\n' +
      'Server event: NotificationCreated\n\n' +
      'Offline users: notifications persisted in DB — GET /api/notifications/me after login.\n' +
      'No push/email/outbox in v1.\n' +
      'See docs/07_REALTIME_AND_DOMAIN_EVENTS.md',
  }),
]);

// merge AI into debug if renamed
const debugAi = byName['99 Debug / Utility / AI'];
const validation = byName['99 Error Examples / Validation'];

// add auth error examples to validation if missing
if (validation) {
  const authErrors = [
    req('Login wrong password (expect 401)', 'POST', '/api/auth/login', {
      noAuth: true,
      body: jsonBody('{\n  "email": "test@example.com",\n  "password": "WrongPassword!"\n}'),
      tests: ["pm.test('401 Unauthorized', () => pm.response.to.have.status(401));"],
    }),
    req('Register invalid email (expect 400)', 'POST', '/api/auth/register', {
      noAuth: true,
      body: jsonBody('{\n  "email": "not-an-email",\n  "password": "Test123!"\n}'),
      tests: ["pm.test('400 validation', () => pm.response.to.have.status(400));"],
    }),
    req('Get Me without token (expect 401)', 'GET', '/api/profile/me', {
      noAuth: true,
      tests: ["pm.test('401 Unauthorized', () => pm.response.to.have.status(401));"],
    }),
    req('Admin endpoint with user token (expect 403)', 'GET', '/api/admin/users?page=1&pageSize=5', {
      auth: bearer('{{accessToken}}'),
      tests: ["pm.test('403 Forbidden', () => pm.response.to.have.status(403));"],
    }),
    req('Create Post empty body (expect 400)', 'POST', '/api/content/me/posts', {
      auth: bearer(),
      body: jsonBody('{}'),
      tests: ["pm.test('400 validation', () => pm.response.to.have.status(400));"],
    }),
    req('Upload Avatar without file (expect 400)', 'POST', '/api/profile/me/avatar', {
      auth: bearer(),
      body: { mode: 'formdata', formdata: [{ key: 'file', type: 'file', src: '' }] },
      tests: ["pm.test('400 bad request', () => pm.expect([400, 415]).to.include(pm.response.code));"],
    }),
  ];
  for (const r of authErrors) {
    if (!findRequest(validation.item, r.name)) validation.item.unshift(r);
  }
}

// reorder top-level folders
const orderedNames = [
  '00 Health / Swagger / Base',
  '01 Auth / Account',
  '02 Profile',
  '03 Professional',
  '04 Content',
  '05 Network',
  '06 Messaging',
  '07 Notifications',
  '08 Jobs',
  '09 Events',
  '10 AI',
  '11 Admin',
  '12 File Uploads',
  '13 SignalR Info (not HTTP REST)',
  '99 Error Examples / Validation',
];

const newItems = [];
for (const n of orderedNames) {
  if (n === '00 Health / Swagger / Base') newItems.push(healthFolder);
  else if (n === '12 File Uploads') newItems.push(uploadsFolder);
  else if (n === '13 SignalR Info (not HTTP REST)') newItems.push(signalrFolder);
  else {
    const f = Object.values(byName).find((x) => x.name === n);
    if (f) newItems.push(f);
  }
}

col.info.description =
  'LinkedInDiplom backend API — modular monolith (2026-06-18). Import LinkedInDiplom.local.postman_environment.json. ' +
  'Smoke: 00 Health → 01 Login User A → 01 Login User B → 04 Create post → 06 Create Direct Chat → 08 Apply → Withdraw. ' +
  'See docs/api/POSTMAN_TESTING.md and docs/09_TESTING_AND_POSTMAN.md.';
col.info.version = '2026-06-18-postman-sync';
col.item = newItems;

// collection variables
col.variable = [
  { key: 'baseUrl', value: 'https://localhost:7011' },
  { key: 'apiUrl', value: '{{baseUrl}}/api' },
];

fs.writeFileSync(COLLECTION_PATH, JSON.stringify(col, null, 2));

// --- environment ---
const env = JSON.parse(fs.readFileSync(ENV_PATH, 'utf8'));
const keys = new Set(env.values.map((v) => v.key));
const addVar = (key, value, type) => {
  if (!keys.has(key)) {
    env.values.push({ key, value, type: type || 'default', enabled: true });
    keys.add(key);
  }
};

const updates = {
  baseUrl: 'https://localhost:7011',
  apiUrl: 'https://localhost:7011/api',
  userEmail: 'test@example.com',
  userPassword: 'Test123!',
  userAEmail: 'test@example.com',
  userAPassword: 'Test123!',
  userBEmail: 'test2@example.com',
  userBPassword: 'Test123!',
  otherUserEmail: 'test2@example.com',
  otherUserPassword: 'Test123!',
  adminEmail: 'admin@local.dev',
  adminPassword: 'Admin123!',
};

for (const v of env.values) {
  if (updates[v.key] !== undefined) v.value = updates[v.key];
}

addVar('token', '');
addVar('userAEmail', 'test@example.com');
addVar('userAPassword', 'Test123!');
addVar('userBEmail', 'test2@example.com');
addVar('userBPassword', 'Test123!');
addVar('userAId', '');
addVar('userBId', '');
addVar('apiUrl', 'https://localhost:7011/api');
addVar('userEmail', 'test@example.com');
addVar('userPassword', 'Test123!');
addVar('adminEmail', 'admin@local.dev');
addVar('adminPassword', 'Admin123!');
addVar('participantUserId', '');

// DemoSeed note on credential variables
for (const v of env.values) {
  if (['userAEmail', 'userAPassword', 'userBEmail', 'userBPassword', 'adminEmail', 'adminPassword', 'userEmail', 'userPassword', 'otherUserEmail', 'otherUserPassword'].includes(v.key)) {
    v.description = 'Default from DemoSeed/AdminSeed (Development). See docs/08_SEED_DATA.md.';
  }
  if (v.key === 'participantUserId' && !v.description) {
    v.description = 'Alias for userBId in direct chat; set by Login User B script.';
  }
}

env.name = 'LinkedInDiplom Local';
env._postman_exported_at = new Date().toISOString();

fs.writeFileSync(ENV_PATH, JSON.stringify(env, null, 2));

// validate JSON
JSON.parse(fs.readFileSync(COLLECTION_PATH, 'utf8'));
JSON.parse(fs.readFileSync(ENV_PATH, 'utf8'));

console.log('Postman collection and environment updated successfully.');
console.log('Folders:', newItems.map((f) => f.name).join(', '));
