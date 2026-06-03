export function readApiError(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.message === "string") return data.message;
  if (typeof data.title === "string") return data.title;
  if (typeof data.error === "string") return data.error;
  if (Array.isArray(data.errors) && data.errors.length > 0) return String(data.errors[0]);
  if (data.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors).flat()[0];
    if (first) return String(first);
  }
  return fallback;
}
