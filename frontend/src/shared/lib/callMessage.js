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

export function getMessagePreview(message, t) {
  if (isCallMessage(message)) return getCallMessageText(message, t);
  if (isPostShareMessage(message)) return buildPostSharePreview(message.post, t);
  return String(message?.text || "");
}
