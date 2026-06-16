import { useEffect, useMemo, useState } from 'react';
import { fetchProfilesByUserIds } from '../profile/profileApi.js';
import { getDisplayName } from '../profile/mapProfile.js';

export function getAdminProfileLabel(profiles, userId) {
  if (!userId) return '—';
  const profile = profiles?.[userId];
  if (!profile) return userId;
  return profile.displayName || getDisplayName(profile);
}

export function useAdminProfiles(userIds = []) {
  const key = useMemo(
    () => [...new Set(userIds.filter(Boolean).map(String))].sort().join(','),
    [userIds],
  );
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    const ids = key ? key.split(',') : [];
    if (!ids.length) {
      setProfiles({});
      return undefined;
    }

    let cancelled = false;
    fetchProfilesByUserIds(ids).then((map) => {
      if (!cancelled) setProfiles(map);
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return profiles;
}
