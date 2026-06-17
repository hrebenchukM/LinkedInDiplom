/**
 * Consolidate docs into max 15 files without removing content.
 * Run: node docs/merge-docs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const docsDir = path.dirname(fileURLToPath(import.meta.url));

function read(rel) {
  const p = path.join(docsDir, rel);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8').trimEnd();
}

function sep(title, source) {
  return `\n\n---\n\n<!-- merged from: ${source} -->\n\n# ${title}\n\n`;
}

function merge(outFile, parts) {
  const body = parts
    .filter(Boolean)
    .map((p) => {
      if (typeof p === 'string') return p;
      const content = read(p.file);
      if (!content) return '';
      // strip top-level # title from merged file to avoid duplicate H1
      const stripped = content.replace(/^#\s+.+\n/, '');
      return sep(p.title || p.file, p.file) + stripped.trimStart();
    })
    .join('\n');

  fs.writeFileSync(path.join(docsDir, outFile), body.trimEnd() + '\n');
  console.log('Wrote', outFile);
}

const readmeIndex = `# LinkedInDiplom — документация backend

> **Проект:** дипломная работа — профессиональная социальная сеть (аналог LinkedIn)  
> **Backend:** \`.NET 8\` modular monolith, host \`Facade.API\`  
> **БД:** PostgreSQL 16, одна база, 9 schema  
> **Frontend:** React (Vite), отдельная папка \`frontend/\`  
> **Обновлено:** 2026-06-17

---

## Для защиты диплома — с чего начать

1. **[01_OVERVIEW.md](01_OVERVIEW.md)** — обзор системы  
2. **[02_ARCHITECTURE_AND_MODULES.md](02_ARCHITECTURE_AND_MODULES.md)** — архитектура и модули  
3. **[08_SEED_DATA.md](08_SEED_DATA.md)** — demo seed  
4. **[11_LIMITATIONS_AND_TODO.md](11_LIMITATIONS_AND_TODO.md)** — что готово / что частично  

---

## Карта документов (12 файлов)

| № | Файл | О чём |
|---|------|--------|
| — | **README.md** (этот файл) | Навигация |
| 01 | [01_OVERVIEW.md](01_OVERVIEW.md) | Обзор, tech stack, route prefixes |
| 02 | [02_ARCHITECTURE_AND_MODULES.md](02_ARCHITECTURE_AND_MODULES.md) | Архитектура, core/facade модули, паттерны |
| 03 | [03_DATABASE.md](03_DATABASE.md) | Миграции, schema, таблицы |
| 04 | [04_API_REFERENCE.md](04_API_REFERENCE.md) | Auth/JWT, endpoints, validation, Swagger |
| 05 | [05_CONFIGURATION_AND_UPLOADS.md](05_CONFIGURATION_AND_UPLOADS.md) | appsettings, FileStorage, S3 |
| 06 | [06_INFRASTRUCTURE_AND_DEVELOPMENT.md](06_INFRASTRUCTURE_AND_DEVELOPMENT.md) | Docker, запуск, добавление фич |
| 07 | [07_REALTIME_AND_DOMAIN_EVENTS.md](07_REALTIME_AND_DOMAIN_EVENTS.md) | SignalR, domain events |
| 08 | [08_SEED_DATA.md](08_SEED_DATA.md) | Demo seed orchestrator |
| 09 | [09_TESTING_AND_POSTMAN.md](09_TESTING_AND_POSTMAN.md) | Тесты, Postman collection |
| 10 | [10_FRONTEND_INTEGRATION.md](10_FRONTEND_INTEGRATION.md) | Frontend ↔ backend |
| 11 | [11_LIMITATIONS_AND_TODO.md](11_LIMITATIONS_AND_TODO.md) | Limitations, TODO, защита |

**Postman JSON:** \`docs/postman/LinkedInDiplom.postman_collection.json\` + environment.

---

## Быстрые команды

\`\`\`bash
cd backend/Facade.API
dotnet run --launch-profile https
dotnet build LinkedIn.sln
dotnet test backend/Tests/LinkedIn.Tests/LinkedIn.Tests.csproj
# Swagger: https://localhost:7011/swagger
\`\`\`

---

## API prefixes

| Prefix | Модуль |
|--------|--------|
| \`/api/auth\` | Auth, JWT |
| \`/api/profile\` | Profile, media |
| \`/api/professional\` | Skills, experience |
| \`/api/network\` | Contacts, groups, pages |
| \`/api/content\` | Posts, feed |
| \`/api/messaging\` | Chats, messages |
| \`/api/jobs\` | Vacancies |
| \`/api/events\` | Events |
| \`/api/notifications\` | Notifications |
| \`/api/admin\` | Platform admin |
| \`/api/ai\` | Gemini AI |
| \`/hubs/messaging\` | SignalR |

Подробности — [04_API_REFERENCE.md](04_API_REFERENCE.md).
`;

fs.writeFileSync(path.join(docsDir, 'README.md'), readmeIndex);

merge('02_ARCHITECTURE_AND_MODULES.md', [
  { file: '02_ARCHITECTURE.md', title: 'Архитектура и правила' },
  { file: '03_CORE_MODULES.md', title: 'Core-модули' },
  { file: '04_FACADE_MODULES.md', title: 'Facade-модули' },
  { file: '20_PATTERNS.md', title: 'Паттерны и принципы' },
]);

merge('03_DATABASE.md', [
  { file: '08_INFRA_DB_MIGRATIONS.md', title: 'Миграции и порядок schema' },
  { file: '12_DB_SCHEMA.md', title: 'Логическая схема таблиц' },
]);

merge('04_API_REFERENCE.md', [
  { file: '05_API_AUTH_JWT.md', title: 'Auth и JWT' },
  { file: '06_API_OVERVIEW.md', title: 'Каталог API endpoints' },
  { file: '06_API_VALIDATION_ERRORS_SWAGGER.md', title: 'Validation, errors, Swagger' },
]);

merge('05_CONFIGURATION_AND_UPLOADS.md', [
  { file: '24_CONFIGURATION.md', title: 'Configuration (appsettings)' },
  { file: '09_CONFIG_UPLOADS.md', title: 'FileStorage и uploads' },
]);

merge('06_INFRASTRUCTURE_AND_DEVELOPMENT.md', [
  { file: '07_INFRA_DOCKER.md', title: 'Docker и compose' },
  { file: '10_DEVELOPMENT.md', title: 'Development и запуск' },
]);

merge('07_REALTIME_AND_DOMAIN_EVENTS.md', [
  { file: '18_SIGNALR_CHAT.md', title: 'SignalR / Realtime Chat' },
  { file: '19_DOMAIN_EVENTS_NOTIFICATIONS.md', title: 'Domain Events и Notifications' },
]);

// seed: copy with new name
const seed = read('22_SEED_DATA.md');
if (seed) fs.writeFileSync(path.join(docsDir, '08_SEED_DATA.md'), seed.replace('# 22. Demo Seed Data', '# 08. Demo Seed Data') + '\n');

merge('09_TESTING_AND_POSTMAN.md', [
  { file: '11_TESTS_AND_TROUBLESHOOTING.md', title: 'Тесты и troubleshooting' },
  { file: 'postman/README.md', title: 'Postman quick start' },
  { file: 'api/POSTMAN_TESTING.md', title: 'Postman testing (полная документация)' },
]);

// frontend
const fe = read('25_FRONTEND_INTEGRATION_GUIDE.md');
if (fe) fs.writeFileSync(path.join(docsDir, '10_FRONTEND_INTEGRATION.md'), fe.replace('# 25. Frontend Integration Guide', '# 10. Frontend Integration Guide') + '\n');

merge('11_LIMITATIONS_AND_TODO.md', [
  { file: '26_LIMITATIONS_AND_TODO.md', title: 'Limitations and TODO (актуально)' },
  { file: '13_V1_LIMITATIONS.md', title: 'V1 Limitations (legacy, полный текст)' },
]);

// delete old files
const toDelete = [
  '00_README.md',
  '02_ARCHITECTURE.md',
  '03_CORE_MODULES.md',
  '04_FACADE_MODULES.md',
  '05_API_AUTH_JWT.md',
  '06_API_OVERVIEW.md',
  '06_API_VALIDATION_ERRORS_SWAGGER.md',
  '07_INFRA_DOCKER.md',
  '08_INFRA_DB_MIGRATIONS.md',
  '09_CONFIG_UPLOADS.md',
  '10_DEVELOPMENT.md',
  '11_TESTS_AND_TROUBLESHOOTING.md',
  '12_DB_SCHEMA.md',
  '13_V1_LIMITATIONS.md',
  '18_SIGNALR_CHAT.md',
  '19_DOMAIN_EVENTS_NOTIFICATIONS.md',
  '20_PATTERNS.md',
  '22_SEED_DATA.md',
  '24_CONFIGURATION.md',
  '25_FRONTEND_INTEGRATION_GUIDE.md',
  '26_LIMITATIONS_AND_TODO.md',
  'api/POSTMAN_TESTING.md',
  'postman/README.md',
];

for (const f of toDelete) {
  const p = path.join(docsDir, f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log('Deleted', f);
  }
}

// remove empty api dir
const apiDir = path.join(docsDir, 'api');
if (fs.existsSync(apiDir) && fs.readdirSync(apiDir).length === 0) {
  fs.rmdirSync(apiDir);
  console.log('Removed empty api/');
}

console.log('Done. docs/ now has', fs.readdirSync(docsDir).filter((f) => f.endsWith('.md')).length, 'markdown files at root.');
