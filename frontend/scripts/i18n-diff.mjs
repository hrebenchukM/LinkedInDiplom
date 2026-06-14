import fs from "fs";

const src = fs.readFileSync("src/app/providers/AppProviders.jsx", "utf8");

function extractLang(lang) {
  const marker = `${lang}: {`;
  const start = src.indexOf(marker);
  let i = start + marker.length;
  let depth = 1;
  while (i < src.length && depth > 0) {
    if (src[i] === "{") depth += 1;
    if (src[i] === "}") depth -= 1;
    i += 1;
  }
  const block = src.slice(start + marker.length, i - 1);
  const keys = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^\s*"([^"]+)":/);
    if (m) keys[m[1]] = true;
  }
  return keys;
}

const en = extractLang("en");
const uk = extractLang("uk");
const missing = Object.keys(en).filter((k) => !uk[k]);
console.log("missing in uk base:", missing.length);
console.log(missing.join("\n"));
