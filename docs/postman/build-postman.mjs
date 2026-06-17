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
  '  if (access) { pm.environment.set("accessToken", access); console.log("accessToken saved"); }',
  '  if (refresh) { pm.environment.set("refreshToken", refresh); console.log("refreshToken saved"); }',
  '  if (uid) { pm.environment.set("userId", uid); console.log("userId saved:", uid); }',
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
  '    console.log("adminAccessToken saved");',
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
    if (r.name === 'Login') r.event = testEvent(SAVE_USER_TOKEN);
    if (r.name === 'Register') r.event = testEvent(SAVE_REGISTER_USER);
    if (r.name === 'Refresh Token') r.event = testEvent(SAVE_REFRESH);
  }
  // add Login Demo User (Marya) for seed data
  if (!findRequest(authFolder.item, 'Login Demo User (Marya)')) {
    authFolder.item.splice(2, 0, req('Login Demo User (Marya)', 'POST', '/api/auth/login', {
      body: jsonBody('{\n  "email": "marya101204@gmail.com",\n  "password": "Mgg101204"\n}'),
      description: 'Primary showcase user from demo seed. Password may differ — check DemoSeed options.',
      tests: SAVE_USER_TOKEN,
    }));
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

// jobs - add minSalaryFrom + save vacancy id on create
const jobsFolder = byName['07 Jobs'];
if (jobsFolder) {
  if (!findRequest(jobsFolder.item, 'Get Vacancies (minSalaryFrom)')) {
    const pagedIdx = jobsFolder.item.findIndex((x) => x.name === 'Get Vacancies (paged)');
    jobsFolder.item.splice(pagedIdx + 1, 0, req('Get Vacancies (minSalaryFrom)', 'GET', '/api/jobs/vacancies?minSalaryFrom=80000&page=1&pageSize=20', {
      description: 'Filter vacancies with salaryFrom >= minSalaryFrom. Requires JWT.',
    }));
  }
  const createVac = findRequest(jobsFolder.item, 'Create Vacancy');
  if (createVac && !createVac.event) createVac.event = testEvent(saveIdTest('vacancyId', 'vacancy'));
}

// admin folder patches
const adminFolder = byName['10 Admin'];
if (adminFolder) {
  adminFolder.name = '11 Admin';
  const adminLogin = findRequest(adminFolder.item, 'Admin Login');
  if (adminLogin) adminLogin.event = testEvent(SAVE_ADMIN_TOKEN);
  const adminApi = adminFolder.item.find((x) => x.name === 'Admin API');
  if (adminApi) {
    adminApi.auth = bearer('{{adminAccessToken}}');
    patchAuthAdmin(adminApi.item);
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
  '10 File Uploads',
  uploadDefs.map(([name, method, urlPath, token, note]) =>
    req(name, method, urlPath, {
      auth: bearer(token),
      body: formFileUpload(),
      description: `form-data field \`file\` (type File — select manually in Postman). ${note}. Returns URL in response DTO.`,
    })
  ),
  bearer()
);

const signalrFolder = folder('12 SignalR Info (not HTTP)', [
  req('README — SignalR Hub', 'GET', '/swagger/index.html', {
    noAuth: true,
    description:
      'SignalR cannot be fully tested via REST.\n\n' +
      'Hub URL: {{baseUrl}}/hubs/messaging?access_token={{accessToken}}\n\n' +
      'Client methods: JoinChat(chatId), LeaveChat(chatId)\n\n' +
      'Server events: MessageCreated, MessageUpdated, MessageDeleted, MessageRead, MessageMediaAttached\n\n' +
      'See docs/18_SIGNALR_CHAT.md and frontend/scripts/verify-signalr.mjs',
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
  '03 Content',
  '04 Network',
  '05 Messaging',
  '06 Jobs',
  '07 Events',
  '08 Professional',
  '09 Notifications',
  '10 File Uploads',
  '11 Admin',
  '12 SignalR Info (not HTTP)',
  '99 Debug / Utility / AI',
  '99 Error Examples / Validation',
];

const newItems = [];
for (const n of orderedNames) {
  if (n === '00 Health / Swagger / Base') newItems.push(healthFolder);
  else if (n === '10 File Uploads') newItems.push(uploadsFolder);
  else if (n === '12 SignalR Info (not HTTP)') newItems.push(signalrFolder);
  else {
    const f = Object.values(byName).find((x) => x.name === n);
    if (f) newItems.push(f);
  }
}

col.info.description =
  'LinkedInDiplom backend API — modular monolith. Import with LinkedInDiplom.local.postman_environment.json. ' +
  'Run 01 Auth → Login, then 11 Admin → Admin Login. See docs/api/POSTMAN_TESTING.md.';
col.info.version = '2026-06-17';
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
  adminEmail: 'admin@local.dev',
  adminPassword: 'Admin123!',
  otherUserEmail: 'test2@example.com',
  otherUserPassword: 'Test123!',
};

for (const v of env.values) {
  if (updates[v.key] !== undefined) v.value = updates[v.key];
  if (v.key === 'adminToken' && !v.value) v.value = '';
  if (v.key === 'adminAccessToken' && !v.value) v.value = '';
}

addVar('apiUrl', 'https://localhost:7011/api');
addVar('userEmail', 'test@example.com');
addVar('userPassword', 'Test123!');
addVar('adminEmail', 'admin@local.dev');
addVar('adminPassword', 'Admin123!');

env.name = 'LinkedInDiplom Local';
env._postman_exported_at = new Date().toISOString();

fs.writeFileSync(ENV_PATH, JSON.stringify(env, null, 2));

// validate JSON
JSON.parse(fs.readFileSync(COLLECTION_PATH, 'utf8'));
JSON.parse(fs.readFileSync(ENV_PATH, 'utf8'));

console.log('Postman collection and environment updated successfully.');
console.log('Folders:', newItems.map((f) => f.name).join(', '));
