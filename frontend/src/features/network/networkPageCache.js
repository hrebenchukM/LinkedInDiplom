const emptyCounts = {
  incoming: 0,
  outgoing: 0,
  contacts: 0,
  groups: 0,
  pages: 0,
};

let cache = {
  userId: null,
  incoming: [],
  outgoing: [],
  contacts: [],
  suggestions: [],
  pendingCounts: { ...emptyCounts },
};

export function getNetworkPageCache(userId) {
  if (!userId || cache.userId !== String(userId)) return null;
  return {
    incoming: cache.incoming,
    outgoing: cache.outgoing,
    contacts: cache.contacts,
    suggestions: cache.suggestions,
    pendingCounts: cache.pendingCounts,
  };
}

export function setNetworkPageCache(userId, data) {
  if (!userId) return;
  cache = {
    userId: String(userId),
    incoming: data.incoming ?? [],
    outgoing: data.outgoing ?? [],
    contacts: data.contacts ?? [],
    suggestions: data.suggestions ?? [],
    pendingCounts: data.pendingCounts ?? { ...emptyCounts },
  };
}

export function clearNetworkPageCache(userId) {
  if (!userId || cache.userId !== String(userId)) return;
  cache = {
    userId: null,
    incoming: [],
    outgoing: [],
    contacts: [],
    suggestions: [],
    pendingCounts: { ...emptyCounts },
  };
}
