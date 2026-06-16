/** Single-line preview for chat list rows (AI replies can be very long). */
export function truncateChatPreview(text, maxLen = 56) {
  if (!text) return '';
  const single = String(text).replace(/\s+/g, ' ').trim();
  if (single.length <= maxLen) return single;
  return `${single.slice(0, maxLen - 1)}…`;
}

export function formatChatTime(value, dateLocale) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' });
}
