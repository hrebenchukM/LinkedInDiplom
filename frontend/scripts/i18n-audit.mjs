import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { mergeDict } from "../src/app/i18n/mergeDict.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const providersPath = path.join(root, "src/app/providers/AppProviders.jsx");
const src = fs.readFileSync(providersPath, "utf8");

function extractLang(lang) {
  const marker = `${lang}: {`;
  const start = src.indexOf(marker);
  if (start < 0) return {};
  let i = start + marker.length;
  let depth = 1;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    i += 1;
  }
  const block = src.slice(start + marker.length, i - 1);
  const keys = {};
  for (const line of block.split("\n")) {
    const km = line.match(/^\s*"([^"]+)":/);
    if (km) keys[km[1]] = true;
  }
  return keys;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") walk(full, files);
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const base = {
  en: extractLang("en"),
  uk: extractLang("uk"),
  es: extractLang("es"),
  de: extractLang("de"),
};
const merged = mergeDict(
  Object.fromEntries(Object.entries(base).map(([lang, keys]) => [lang, Object.fromEntries(Object.keys(keys).map((k) => [k, ""]))])),
);
const en = merged.en;
const uk = merged.uk;
const enKeys = Object.keys(en).sort();

const used = new Map();
const usedRe = /\bt\s*\(\s*"([^"]+)"\s*,\s*"((?:\\.|[^"\\])*)"/g;
const usedRe2 = /\bt\s*\(\s*"([^"]+)"\s*,\s*'((?:\\.|[^'\\])*)'/g;
for (const file of walk(path.join(root, "src"))) {
  const content = fs.readFileSync(file, "utf8");
  for (const re of [usedRe, usedRe2]) {
    let m;
    while ((m = re.exec(content))) {
      used.set(m[1], m[2].replace(/\\"/g, '"'));
    }
  }
}

const missingUk = enKeys.filter((k) => !uk[k]);
const missingUsedUk = [...used.keys()].filter((k) => !uk[k]);
const missingFromEn = [...used.keys()].filter((k) => !en[k]);

console.log(JSON.stringify({
  enCount: enKeys.length,
  ukCount: Object.keys(uk).length,
  usedCount: used.size,
  missingUkFromEn: missingUk.length,
  missingUsedInUk: missingUsedUk.length,
  missingFromEnDict: missingFromEn.length,
  missingUsedInUkKeys: missingUsedUk.slice(0, 20),
  missingFromEnKeys: missingFromEn.slice(0, 20),
}, null, 2));
