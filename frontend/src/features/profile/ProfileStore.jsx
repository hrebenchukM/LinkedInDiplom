import { createContext, useContext, useMemo, useState } from "react";
import { readJson, writeJson } from "../../shared/lib/storage";

const PROFILE_KEY = "spaProfile";
const initialProfile = {
  name: "Student User",
  headline: "React Frontend Engineer",
  city: "Kyiv",
  about: "Building a single-page professional network frontend.",
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => readJson(PROFILE_KEY, initialProfile));

  const value = useMemo(
    () => ({
      profile,
      updateProfile(patch) {
        const next = { ...profile, ...patch };
        setProfile(next);
        writeJson(PROFILE_KEY, next);
      },
    }),
    [profile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileStore() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileStore must be used inside ProfileProvider");
  return ctx;
}
