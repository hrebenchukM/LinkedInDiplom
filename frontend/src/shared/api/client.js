import { del, get, patch, post, put, upload } from './http.js';

function normalizeGetArgs(path, queryOrOptions) {
  if (
    queryOrOptions &&
    typeof queryOrOptions === 'object' &&
    ('query' in queryOrOptions ||
      'headers' in queryOrOptions ||
      'signal' in queryOrOptions)
  ) {
    return { path, options: queryOrOptions };
  }

  return {
    path,
    options: queryOrOptions ? { query: queryOrOptions } : {},
  };
}

export const apiClient = {
  get(path, queryOrOptions) {
    const { path: resolvedPath, options } = normalizeGetArgs(path, queryOrOptions);
    return get(resolvedPath, options);
  },

  post(path, body, options = {}) {
    return post(path, body, options);
  },

  put(path, body, options = {}) {
    return put(path, body, options);
  },

  patch(path, body, options = {}) {
    return patch(path, body, options);
  },

  delete(path, options = {}) {
    return del(path, options);
  },

  upload(path, formData, options = {}) {
    return upload(path, formData, options);
  },
};

export default apiClient;
