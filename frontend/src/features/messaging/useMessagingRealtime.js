import { useEffect } from 'react';
import { getAccessToken } from '../../shared/api/tokens.js';
import { getUserIdFromToken } from '../../shared/lib/jwtClaims.js';
import {
  startMessagingConnection,
  stopMessagingConnection,
  syncJoinedChats,
  onMessageCreated,
  offMessageCreated,
  onMessageUpdated,
  offMessageUpdated,
} from './signalRService.js';
import { getMyChats } from './messagingApi.js';
import { notifyMessagingChanged, MESSAGING_CHANGED_EVENT } from './messagingEvents.js';
import { buildChatPreviewText } from './chatPreview.js';
import { isTestChatContent } from './mapMessaging.js';
import { setStoredChatPreview } from './userInitiatedChats.js';

const HUB_SYNC_INTERVAL_MS = 30000;

async function loadChatIds(currentUserId) {
  const result = await getMyChats({ page: 1, pageSize: 100 }, currentUserId);
  return (result.items ?? []).map((chat) => chat.id).filter(Boolean);
}

/** Keeps messaging SignalR alive and subscribed to all user chat groups for the session. */
export function useMessagingRealtime(enabled, currentUserId) {
  const resolvedUserId =
    currentUserId ?? (enabled ? getUserIdFromToken(getAccessToken()) : null);

  useEffect(() => {
    if (!enabled || !resolvedUserId) return undefined;

    let cancelled = false;

    const syncHubGroups = async () => {
      try {
        await startMessagingConnection();
        if (cancelled) return;

        const chatIds = await loadChatIds(resolvedUserId);
        if (cancelled) return;

        await syncJoinedChats(chatIds);
      } catch {
        /* hub or chat list unavailable */
      }
    };

    const onIncomingMessage = (message) => {
      if (!message?.id) return;
      if (message.content && isTestChatContent(message.content)) return;

      if (message.chatId) {
        const preview = buildChatPreviewText(message);
        if (preview) {
          setStoredChatPreview(message.chatId, preview);
        }
        syncJoinedChats([message.chatId]);
      }

      notifyMessagingChanged();
    };

    syncHubGroups();

    onMessageCreated(onIncomingMessage);
    onMessageUpdated(onIncomingMessage);
    window.addEventListener(MESSAGING_CHANGED_EVENT, syncHubGroups);

    const intervalId = window.setInterval(syncHubGroups, HUB_SYNC_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener(MESSAGING_CHANGED_EVENT, syncHubGroups);
      offMessageCreated(onIncomingMessage);
      offMessageUpdated(onIncomingMessage);
      stopMessagingConnection();
    };
  }, [enabled, resolvedUserId]);
}
