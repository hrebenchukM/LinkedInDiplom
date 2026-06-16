import * as signalR from '@microsoft/signalr';
import { resolveSignalRHubUrl } from '../../shared/api/config.js';
import { getAccessToken } from '../../shared/api/tokens.js';
import { mapMessageDto, mapMessageMediaDto } from './mapMessaging.js';

let connection = null;
let startPromise = null;
let listenersAttached = false;

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

  startPromise = connection
    .start()
    .then(() => connection)
    .catch((error) => {
      console.warn('SignalR messaging connection failed:', error);
      connection = null;
      listenersAttached = false;
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
    startPromise = null;
  }
}

export async function joinChat(chatId) {
  if (!chatId) return;

  const hub = await startMessagingConnection();
  if (!hub) return;

  try {
    await hub.invoke('JoinChat', chatId);
  } catch (error) {
    console.warn(`SignalR JoinChat failed for ${chatId}:`, error);
  }
}

export async function leaveChat(chatId) {
  if (!chatId || !connection) return;

  try {
    await connection.invoke('LeaveChat', chatId);
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
