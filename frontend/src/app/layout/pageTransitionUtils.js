/** Main app sections — used for slide direction (left/right). */
export const NAV_ORDER = {
  '/app': 0,
  '/app/network': 1,
  '/app/vacancies': 2,
  '/app/messages': 3,
  '/app/notifications': 4,
  '/app/profile': 5,
  '/app/admin': 6,
};

const PUBLIC_ORDER = {
  '/splash': 0,
  '/landing': 1,
  '/auth': 2,
};

/**
 * Collapse nested routes so switching chats does not re-trigger a page transition.
 */
export function getTransitionKey(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/app') return '/app';
  if (path.startsWith('/app/messages')) return '/app/messages';
  if (path.startsWith('/app/profile')) return '/app/profile';
  if (path.startsWith('/app/admin')) return '/app/admin';

  if (path.startsWith('/app/')) {
    const section = path.split('/')[2];
    return section ? `/app/${section}` : '/app';
  }

  return path;
}

export function getNavDirection(fromKey, toKey, orderMap = NAV_ORDER) {
  const from = orderMap[fromKey] ?? 99;
  const to = orderMap[toKey] ?? 99;
  if (from === to) return 'neutral';
  return to > from ? 'forward' : 'back';
}

export function getPublicTransitionKey(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (PUBLIC_ORDER[path] !== undefined) return path;
  return path;
}

export function getPublicNavDirection(fromKey, toKey) {
  return getNavDirection(fromKey, toKey, PUBLIC_ORDER);
}
