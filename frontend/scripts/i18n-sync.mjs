import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const providersPath = path.join(root, "src/app/providers/AppProviders.jsx");
const extraDir = path.join(root, "src/app/i18n/extra");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== "extra") walk(full, files);
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function collectUsedStrings() {
  const used = new Map();
  const reList = [
    /\bt\s*\(\s*"([^"]+)"\s*,\s*"((?:\\.|[^"\\])*)"/g,
    /\bt\s*\(\s*"([^"]+)"\s*,\s*'((?:\\.|[^'\\])*)'/g,
  ];
  for (const file of walk(path.join(root, "src"))) {
    if (file.includes("AppProviders.jsx")) continue;
    const content = fs.readFileSync(file, "utf8");
    for (const re of reList) {
      let m;
      while ((m = re.exec(content))) {
        used.set(m[1], m[2].replace(/\\"/g, '"'));
      }
    }
  }
  return used;
}

function parseDictLang(lang) {
  const src = fs.readFileSync(providersPath, "utf8");
  const marker = `${lang}: {`;
  const start = src.indexOf(marker);
  if (start < 0) return {};
  let i = start + marker.length;
  let depth = 1;
  while (i < src.length && depth > 0) {
    if (src[i] === "{") depth += 1;
    if (src[i] === "}") depth -= 1;
    i += 1;
  }
  const block = src.slice(start + marker.length, i - 1);
  const dict = {};
  const pairRe = /"([^"]+)":\s*"((?:\\.|[^"\\])*)"/g;
  let m;
  while ((m = pairRe.exec(block))) {
    dict[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\n/g, "\n");
  }
  const pairReMultiline = /"([^"]+)":\s*\n\s*"((?:\\.|[^"\\])*)"/g;
  while ((m = pairReMultiline.exec(block))) {
    dict[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\n/g, "\n");
  }
  return dict;
}

function loadJson(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sorted = Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(file, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
}

const UK_GLOSSARY = {
  Admin: "Адмін",
  Dashboard: "Панель",
  Users: "Користувачі",
  Content: "Контент",
  Comments: "Коментарі",
  Jobs: "Вакансії",
  Events: "Події",
  Roles: "Ролі",
  Search: "Пошук",
  Loading: "Завантаження",
  Cancel: "Скасувати",
  Delete: "Видалити",
  Restore: "Відновити",
  Save: "Зберегти",
  Publish: "Опублікувати",
  Hashtag: "Хештег",
  Mention: "Згадка",
  Online: "Онлайн",
  Network: "Мережа",
  Profile: "Профіль",
  Messages: "Повідомлення",
  Notifications: "Сповіщення",
};

function autoUk(enText) {
  if (!enText) return enText;
  let out = enText;
  for (const [from, to] of Object.entries(UK_GLOSSARY)) {
    out = out.replaceAll(from, to);
  }
  const exact = {
    "Could not load notifications.": "Не вдалося завантаити сповіщення.",
    "Mark all read": "Позначити все прочитаним",
    "No notifications yet.": "Сповіщень поки немає.",
    "Hashtag": "Хештег",
    "Mention": "Згадка",
    "Publishing…": "Публікується…",
    "Close": "Закрити",
    "Search people to mention": "Пошук людей для згадки",
    "Access denied": "Доступ заборонено",
    "Back to app": "Назад до застосунку",
    "Create event": "Створити подію",
    "Join": "Приєднатися",
    "Leave": "Покинути",
    "Discover": "Огляд",
    "Attending": "Відвідую",
    "Sign in with your account to browse and join events.":
      "Увійдіть у свій акаунт, щоб переглядати події та приєднуватися.",
  };
  return exact[out] || out;
}

function autoEs(enText) {
  const exact = {
    Hashtag: "Hashtag",
    Mention: "Mención",
    "Mark all read": "Marcar todo como leído",
    "Create event": "Crear evento",
  };
  return exact[enText] || enText;
}

function autoDe(enText) {
  const exact = {
    Hashtag: "Hashtag",
    Mention: "Erwähnung",
    "Mark all read": "Alle als gelesen markieren",
    "Create event": "Event erstellen",
  };
  return exact[enText] || enText;
}

const used = collectUsedStrings();
const baseEn = parseDictLang("en");
const baseUk = parseDictLang("uk");
const baseEs = parseDictLang("es");
const baseDe = parseDictLang("de");

const existingExtraEn = loadJson(path.join(extraDir, "en.json"));
const existingExtraUk = loadJson(path.join(extraDir, "uk.json"));
const existingExtraEs = loadJson(path.join(extraDir, "es.json"));
const existingExtraDe = loadJson(path.join(extraDir, "de.json"));

const extraEn = { ...existingExtraEn };
const extraUk = { ...existingExtraUk };
const extraEs = { ...existingExtraEs };
const extraDe = { ...existingExtraDe };

for (const [key, fallback] of used.entries()) {
  const enValue = baseEn[key] || extraEn[key] || fallback;
  if (!baseEn[key] && !extraEn[key]) extraEn[key] = enValue;
  if (!baseUk[key] && !extraUk[key]) extraUk[key] = autoUk(enValue);
  if (!baseEs[key] && !extraEs[key]) extraEs[key] = autoEs(enValue);
  if (!baseDe[key] && !extraDe[key]) extraDe[key] = autoDe(enValue);
}

saveJson(path.join(extraDir, "en.json"), extraEn);
saveJson(path.join(extraDir, "uk.json"), extraUk);
saveJson(path.join(extraDir, "es.json"), extraEs);
saveJson(path.join(extraDir, "de.json"), extraDe);

console.log(`Synced extras: en=${Object.keys(extraEn).length} uk=${Object.keys(extraUk).length}`);
