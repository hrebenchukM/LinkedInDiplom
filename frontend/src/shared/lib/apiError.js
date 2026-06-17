const DEFAULT_MESSAGES = {
  400: 'Invalid request.',
  401: 'Authentication required.',
  403: 'You do not have permission to perform this action.',
  404: 'Resource not found.',
  500: 'Server error. Please try again later.',
};

export class ApiError extends Error {
  constructor({ status, message, errors = [], fieldErrors = {}, raw = null, url = null, method = null }) {
    super(message || DEFAULT_MESSAGES[status] || 'Request failed.');
    this.name = 'ApiError';
    this.status = status;
    this.errors = Array.isArray(errors) ? errors : [];
    this.fieldErrors = fieldErrors && typeof fieldErrors === 'object' ? fieldErrors : {};
    this.raw = raw;
    this.url = url;
    this.method = method;
  }
}

export function normalizeFieldErrors(fieldErrors) {
  if (!fieldErrors || typeof fieldErrors !== 'object') {
    return {};
  }

  return Object.entries(fieldErrors).reduce((acc, [field, messages]) => {
    if (Array.isArray(messages)) {
      acc[field] = messages.filter(Boolean).map(String);
    } else if (messages != null && messages !== '') {
      acc[field] = [String(messages)];
    } else {
      acc[field] = [];
    }
    return acc;
  }, {});
}

function extractErrors(body) {
  if (!body || typeof body !== 'object') {
    return [];
  }

  const list = body.errors ?? body.Errors;
  if (Array.isArray(list)) {
    return list.filter(Boolean).map(String);
  }

  if (typeof body.message === 'string' && body.message.trim()) {
    return [body.message.trim()];
  }

  return [];
}

function extractFieldErrors(body) {
  if (!body || typeof body !== 'object') {
    return {};
  }

  return normalizeFieldErrors(body.fieldErrors ?? body.FieldErrors);
}

function buildMessage(status, errors) {
  if (errors.length > 0) {
    return errors.join(' ');
  }

  return DEFAULT_MESSAGES[status] || 'Request failed.';
}

export function parseApiError(response, body, meta = {}) {
  const status = response?.status ?? 0;
  const errors = extractErrors(body);
  const fieldErrors = extractFieldErrors(body);

  return new ApiError({
    status,
    message: buildMessage(status, errors),
    errors,
    fieldErrors,
    raw: body,
    url: meta.url ?? null,
    method: meta.method ?? null,
  });
}

export function logApiError(error, context = 'API') {
  if (!import.meta.env.DEV || !error) return;

  if (error instanceof ApiError) {
    console.warn(`[${context}]`, {
      status: error.status,
      method: error.method,
      url: error.url,
      message: error.message,
      errors: error.errors,
      fieldErrors: error.fieldErrors,
      raw: error.raw,
    });
    return;
  }

  console.warn(`[${context}]`, error);
}

export function getErrorMessage(error) {
  if (!error) {
    return 'Unknown error.';
  }

  if (error instanceof ApiError) {
    if (error.message) return error.message;
    if (error.errors?.length) return error.errors.join(' ');
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error.';
}

export function isValidationError(error) {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 400) return true;
  return Object.keys(error.fieldErrors ?? {}).length > 0;
}

export function getUserFriendlyErrorMessage(error, fallback = 'Не удалось загрузить данные. Проверьте параметры фильтра.') {
  if (isValidationError(error)) {
    logApiError(error, 'validation');
    return fallback;
  }

  logApiError(error, 'API');
  return getErrorMessage(error);
}
