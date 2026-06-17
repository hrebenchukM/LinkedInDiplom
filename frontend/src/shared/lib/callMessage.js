import { buildPostSharePreview, isPostShareMessage } from "./postShare";

export function isCallMessage(message) {
  return message?.type === "call";
}

export function getCallMessageText(message, t) {
  if (message?.callStatus === "missed") {
    return t("chat.callMessage.missed", "Missed call");
  }
  return t("chat.callMessage.cancelled", "Cancelled call");
}

export function buildCallMessage({ chatId, callStatus = "missed", currentUserId, t }) {
  const now = new Date().toISOString();
  const message = {
    id: `call-${Date.now()}`,
    chatId,
    type: "call",
    callStatus,
    senderId: currentUserId,
    isMine: true,
    sentAt: now,
    createdAt: now,
  };

  if (t) {
    message.content = getCallMessageText(message, t);
  }

  return message;
}

export function mergeCallMessages(apiMessages = [], callMessages = []) {
  const merged = [...apiMessages, ...callMessages];
  const seen = new Set();

  return merged.filter((message) => {
    const key = String(message?.id ?? "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getMessagePreview(message, t) {
  if (isCallMessage(message)) return getCallMessageText(message, t);
  if (isPostShareMessage(message)) return buildPostSharePreview(message.post, t);
  return String(message?.text || "");
}
