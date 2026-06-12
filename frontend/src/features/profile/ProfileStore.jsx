import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { withLoadState } from "../../shared/lib/asyncLoad";
import { readJson, writeJson } from "../../shared/lib/storage";
import { readRegisteredAccount, patchRegisteredAccount } from "../../shared/lib/registeredAccount";
import { loadMyExperienceHistoryItems } from "../professional/professionalApi";
import {
  mapProfileDtoToRegisteredPatch,
  mapProfileDtoToUiProfile,
  mapProfileFormToPatchRequest,
} from "./mapProfile";
import * as profileApi from "./profileApi";

const PROFILE_KEY = "spaProfile";

const ProfileContext = createContext(null);

function buildFormFromSources(sessionUser, registered, cachedProfile) {
  const saved = registered || {};
  const seedName = sessionUser?.name || cachedProfile.name || "Student User";
  const parts = String(seedName).trim().split(/\s+/);
  return {
    firstName: saved.firstName || sessionUser?.firstName || parts[0] || "",
    lastName: saved.lastName || sessionUser?.lastName || parts.slice(1).join(" ") || "",
    email: saved.email || sessionUser?.email || "",
    specialty: saved.specialty || cachedProfile.headline || sessionUser?.headline || "",
    position: saved.position || "",
    company: saved.company || "",
    city: saved.city || cachedProfile.city || "",
    country: saved.country || "",
    about: saved.about || cachedProfile.about || "",
    education: saved.education || "",
  };
}

export function ProfileProvider({ children }) {
  const { session, isReady } = useAuth();
  const [profile, setProfile] = useState(() => readJson(PROFILE_KEY, { name: "Student User", headline: "", city: "", about: "" }));
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const applyProfileDto = useCallback(
    (dto) => {
      if (!dto) return;
      const account = readRegisteredAccount();
      const registeredPatch = mapProfileDtoToRegisteredPatch(dto);
      patchRegisteredAccount({ ...registeredPatch, email: account.email || session.user?.email });
      const uiProfile = mapProfileDtoToUiProfile(dto, account);
      setProfile(uiProfile);
      writeJson(PROFILE_KEY, uiProfile);
    },
    [session.user?.email],
  );

  const reloadFromApi = useCallback(async () => {
    if (!isReady || !session.isAuthenticated || session.user?.isGuest || USE_MOCK_AUTH) {
      return null;
    }
    return withLoadState({ setIsLoading, setLoadError }, async () => {
      const dto = await profileApi.fetchMyProfile();
      if (dto) applyProfileDto(dto);
      return dto;
    }, "Failed to load profile.");
  }, [isReady, session.isAuthenticated, session.user?.isGuest, applyProfileDto]);

  useEffect(() => {
    if (!isReady || !session.isAuthenticated || session.user?.isGuest) return;
    reloadFromApi();
  }, [isReady, session.isAuthenticated, session.user?.id, session.user?.isGuest, reloadFromApi]);

  const value = useMemo(
    () => ({
      profile,
      isLoading,
      loadError,
      reloadFromApi,
      async loadProfessionalIntoForm() {
        if (!session.isAuthenticated || session.user?.isGuest || USE_MOCK_AUTH) return [];
        return loadMyExperienceHistoryItems();
      },
      buildInitialForm() {
        return buildFormFromSources(session.user, readRegisteredAccount(), profile);
      },
      updateProfile(patch) {
        const next = { ...profile, ...patch };
        setProfile(next);
        writeJson(PROFILE_KEY, next);
      },
      async saveProfileForm(form) {
        if (session.user?.isGuest || USE_MOCK_AUTH) {
          const name = `${form.firstName} ${form.lastName}`.trim() || profile.name;
          const next = {
            name,
            headline: form.specialty || profile.headline,
            city: form.city || "",
            about: form.about || "",
          };
          setProfile(next);
          writeJson(PROFILE_KEY, next);
          patchRegisteredAccount({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            city: form.city,
            country: form.country,
            about: form.about,
            specialty: form.specialty,
            position: form.position,
            company: form.company,
          });
          return { ok: true };
        }

        const patchBody = mapProfileFormToPatchRequest(form);
        const result = await profileApi.patchMyProfile(patchBody);
        if (!result.success) {
          const err = Array.isArray(result.errors) ? result.errors[0] : "Failed to save profile.";
          throw new Error(String(err || "Failed to save profile."));
        }

        if (result.profile) {
          applyProfileDto(result.profile);
        } else {
          patchRegisteredAccount({
            firstName: form.firstName,
            lastName: form.lastName,
            city: form.city,
            country: form.country,
            about: form.about,
            specialty: form.specialty,
            position: form.position,
            company: form.company,
            education: form.education,
          });
          const name = `${form.firstName} ${form.lastName}`.trim() || profile.name;
          const next = {
            name,
            headline: form.specialty || profile.headline,
            city: form.city || "",
            about: form.about || "",
          };
          setProfile(next);
          writeJson(PROFILE_KEY, next);
        }

        return { ok: true, profile: result.profile };
      },
      async uploadAvatar(file) {
        if (session.user?.isGuest || USE_MOCK_AUTH) {
          throw new Error("Avatar upload requires a signed-in API account.");
        }
        const result = await profileApi.uploadMyAvatar(file);
        if (!result.success || !result.profile) {
          throw new Error("Avatar upload failed.");
        }
        applyProfileDto(result.profile);
        return result.profile;
      },
      async uploadHeader(file) {
        if (session.user?.isGuest || USE_MOCK_AUTH) {
          throw new Error("Header upload requires a signed-in API account.");
        }
        const result = await profileApi.uploadMyHeader(file);
        if (!result.success || !result.profile) {
          throw new Error("Header upload failed.");
        }
        applyProfileDto(result.profile);
        return result.profile;
      },
    }),
    [profile, isLoading, loadError, reloadFromApi, session.user, applyProfileDto],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileStore() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileStore must be used inside ProfileProvider");
  return ctx;
}
