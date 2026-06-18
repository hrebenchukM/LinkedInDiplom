import * as signalR from '@microsoft/signalr';
import { resolveNotificationsSignalRHubUrl } from '../../shared/api/config.js';
import { getAccessToken } from '../../shared/api/tokens.js';
import { mapNotificationDto } from './mapNotifications.js';

let connection = null;
let startPromise = null;
let listenersAttached = false;

const handlers = {
  notificationCreated: new Set(),
};

const EVENT_BINDINGS = [
  {
    names: ['NotificationCreated', 'notificationCreated'],
    bucket: 'notificationCreated',
    normalize: (payload) => mapNotificationDto(payload),
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

export function getNotificationsConnection() {
  return connection;
}

export async function connectNotificationsHub() {
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
    .withUrl(resolveNotificationsSignalRHubUrl(), {
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
      console.warn('SignalR notifications connection failed:', error);
      connection = null;
      listenersAttached = false;
      return null;
    })
    .finally(() => {
      startPromise = null;
    });

  return startPromise;
}

export async function disconnectNotificationsHub() {
  if (!connection) return;

  try {
    await connection.stop();
  } catch (error) {
    console.warn('SignalR notifications stop failed:', error);
  } finally {
    connection = null;
    listenersAttached = false;
    startPromise = null;
  }
}

export function onNotificationCreated(handler) {
  handlers.notificationCreated.add(handler);
}

export function offNotificationCreated(handler) {
  handlers.notificationCreated.delete(handler);
}
