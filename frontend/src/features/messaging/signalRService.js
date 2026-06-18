import * as signalR from '@microsoft/signalr';
import { resolveSignalRHubUrl } from '../../shared/api/config.js';
import { getAccessToken } from '../../shared/api/tokens.js';
import { mapMessageDto, mapMessageMediaDto } from './mapMessaging.js';

let connection = null;
let startPromise = null;
let listenersAttached = false;
let reconnectHandlerAttached = false;
/** Last chat opened on the full messages page — kept for backward compatibility. */
let activeJoinedChatId = null;
/** All chat groups this connection should stay subscribed to. */
const joinedChatIds = new Set();

const handlers = {
  messageCreated: new Set(),
  messageUpdated: new Set(),
  messageDeleted: new Set(),
  messageRead: new Set(),
  messageMediaAttached: new Set(),
};

const EVENT_BINDINGS = [
  { names: ['MessageCreated', 'messageCreated'], bucket: 'messageCreated', normalize: (p) => mapMessageDto(p) },
  { names: ['MessageUpdated', 'messageUpdated'], bucket: 'messageUpdated', normalize: (p) => mapMessageDto(p) },
  {
    names: ['MessageDeleted', 'messageDeleted'],
    bucket: 'messageDeleted',
    normalize: (p) => ({
      chatId: p?.chatId ?? p?.ChatId,
      messageId: p?.messageId ?? p?.MessageId,
    }),
  },
  {
    names: ['MessageRead', 'messageRead'],
    bucket: 'messageRead',
    normalize: (p) => ({
      chatId: p?.chatId ?? p?.ChatId,
      id: p?.id ?? p?.Id,
      messageId: p?.messageId ?? p?.MessageId,
      userId: p?.userId ?? p?.UserId,
      readAt: p?.readAt ?? p?.ReadAt,
    }),
  },
  {
    names: ['MessageMediaAttached', 'messageMediaAttached'],
    bucket: 'messageMediaAttached',
    normalize: (p) => ({
      chatId: p?.chatId ?? p?.ChatId,
      messageId: p?.messageId ?? p?.MessageId,
      media: mapMessageMediaDto(p?.media ?? p?.Media),
    }),
  },
];

function attachListeners() {
  if (!connection || listenersAttached) return;

  EVENT_BINDINGS.forEach(({ names, bucket, normalize }) => {
    names.forEach((eventName) => {
      connection.on(eventName, (payload) => {
        const normalized = normalize(payload);
        handlers[bucket].forEach((handler) => handler(normalized));
      });
    });
  });

  listenersAttached = true;
}

function attachReconnectHandler() {
  if (!connection || reconnectHandlerAttached) return;

  connection.onreconnected(async () => {
    const ids = joinedChatIds.size
      ? [...joinedChatIds]
      : activeJoinedChatId
        ? [activeJoinedChatId]
        : [];

    await Promise.all(
      ids.map(async (chatId) => {
        try {
          await connection.invoke('JoinChat', chatId);
        } catch (error) {
          console.warn(`SignalR re-JoinChat failed for ${chatId}:`, error);
        }
      }),
    );
  });

  reconnectHandlerAttached = true;
}

export function getMessagingConnection() {
  return connection;
}

export async function startMessagingConnection() {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  if (connection?.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  if (startPromise) {
    return startPromise;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(resolveSignalRHubUrl(), {
      accessTokenFactory: () => getAccessToken() || '',
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  attachListeners();
  attachReconnectHandler();

  startPromise = connection
    .start()
    .then(() => connection)
    .catch((error) => {
      console.warn('SignalR messaging connection failed:', error);
      connection = null;
      listenersAttached = false;
      reconnectHandlerAttached = false;
      return null;
    })
    .finally(() => {
      startPromise = null;
    });

  return startPromise;
}

export async function stopMessagingConnection() {
  if (!connection) return;

  try {
    await connection.stop();
  } catch (error) {
    console.warn('SignalR stop failed:', error);
  } finally {
    connection = null;
    listenersAttached = false;
    reconnectHandlerAttached = false;
    activeJoinedChatId = null;
    joinedChatIds.clear();
    startPromise = null;
  }
}

async function invokeJoinChat(chatId) {
  const key = String(chatId);
  const hub = await startMessagingConnection();
  if (!hub) return false;

  try {
    await hub.invoke('JoinChat', chatId);
    joinedChatIds.add(key);
    return true;
  } catch (error) {
    console.warn(`SignalR JoinChat failed for ${chatId}:`, error);
    return false;
  }
}

/** Join all listed chats so MessageCreated events reach the session (widget + sidebar). */
export async function syncJoinedChats(chatIds = []) {
  const unique = [...new Set((chatIds ?? []).map(String).filter(Boolean))];
  await Promise.all(unique.map((chatId) => invokeJoinChat(chatId)));
}

export async function joinChat(chatId) {
  if (!chatId) return;

  const joined = await invokeJoinChat(chatId);
  if (joined) {
    activeJoinedChatId = String(chatId);
  }
}

export async function leaveChat(chatId) {
  if (!chatId || !connection) return;

  const key = String(chatId);
  try {
    await connection.invoke('LeaveChat', chatId);
    joinedChatIds.delete(key);
    if (key === activeJoinedChatId) {
      activeJoinedChatId = null;
    }
  } catch (error) {
    console.warn(`SignalR LeaveChat failed for ${chatId}:`, error);
  }
}

export function onMessageCreated(handler) {
  handlers.messageCreated.add(handler);
}

export function offMessageCreated(handler) {
  handlers.messageCreated.delete(handler);
}

export function onMessageUpdated(handler) {
  handlers.messageUpdated.add(handler);
}

export function offMessageUpdated(handler) {
  handlers.messageUpdated.delete(handler);
}

export function onMessageDeleted(handler) {
  handlers.messageDeleted.add(handler);
}

export function offMessageDeleted(handler) {
  handlers.messageDeleted.delete(handler);
}

export function onMessageRead(handler) {
  handlers.messageRead.add(handler);
}

export function offMessageRead(handler) {
  handlers.messageRead.delete(handler);
}

export function onMessageMediaAttached(handler) {
  handlers.messageMediaAttached.add(handler);
}

export function offMessageMediaAttached(handler) {
  handlers.messageMediaAttached.delete(handler);
}
