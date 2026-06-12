import { patchRegisteredAccount } from "../../shared/lib/registeredAccount";

/** Not persisted to Profile / Professional API — device cache only. */
export const PROFILE_LOCAL_ONLY_FIELD_KEYS = ["phone", "resumeName", "resumeDataUrl"];

export function pickLocalProfileFields(form = {}) {
  return {
    phone: form.phone || "",
    resumeName: form.resumeName || "",
    resumeDataUrl: form.resumeDataUrl || "",
  };
}

export function persistLocalProfileFields(form, visibility) {
  patchRegisteredAccount({
    ...pickLocalProfileFields(form),
    visibility,
  });
}
