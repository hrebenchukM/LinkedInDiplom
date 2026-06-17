import { readJson, writeJson } from '../../shared/lib/storage.js';

const RESUME_STORAGE_KEY = 'linkupProfileResumes';

export function getStoredResume(userId) {
  if (!userId) {
    return { resumeName: '', resumeDataUrl: '' };
  }

  const store = readJson(RESUME_STORAGE_KEY, {});
  const entry = store[String(userId)] ?? {};

  return {
    resumeName: entry.resumeName ?? '',
    resumeDataUrl: entry.resumeDataUrl ?? '',
  };
}

export function saveStoredResume(userId, { resumeName, resumeDataUrl }) {
  if (!userId) return null;

  const store = readJson(RESUME_STORAGE_KEY, {});
  store[String(userId)] = {
    resumeName: resumeName ?? '',
    resumeDataUrl: resumeDataUrl ?? '',
  };
  writeJson(RESUME_STORAGE_KEY, store);
  return store[String(userId)];
}

export function clearStoredResume(userId) {
  if (!userId) return;
  const store = readJson(RESUME_STORAGE_KEY, {});
  delete store[String(userId)];
  writeJson(RESUME_STORAGE_KEY, store);
}
