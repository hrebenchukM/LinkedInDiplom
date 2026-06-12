import * as signalR from "@microsoft/signalr";
import { getApiBaseUrl } from "../../shared/api/config";
import { getAccessToken } from "../../shared/api/tokens";

let connection = null;
const joinedChats = new Set();
let handlers = {};

function resolveHubUrl() {
  const base = getApiBaseUrl() || window.location.origin;
  return `${String(base).replace(/\/$/, "")}/hubs/messaging`;
}

function wireHandlers(hub) {
  hub.off("MessageCreated");
  hub.off("MessageUpdated");
  hub.off("MessageDeleted");
  hub.off("MessageRead");
  hub.off("MessageMediaAttached");

  hub.on("MessageCreated", (payload) => handlers.onMessageCreated?.(payload));
  hub.on("MessageUpdated", (payload) => handlers.onMessageUpdated?.(payload));
  hub.on("MessageDeleted", (payload) => handlers.onMessageDeleted?.(payload));
  hub.on("MessageRead", (payload) => handlers.onMessageRead?.(payload));
  hub.on("MessageMediaAttached", (payload) => handlers.onMessageMediaAttached?.(payload));
}

async function rejoinActiveChats() {
  if (!connection || connection.state !== signalR.HubConnectionState.Connected) return;
  const ids = [...joinedChats];
  await Promise.all(
    ids.map(async (chatId) => {
      try {
        await connection.invoke("JoinChat", chatId);
      } catch {
        // ignore transient join failures; next reconnect will retry
      }
    }),
  );
}

export function getMessagingHubState() {
  return connection?.state ?? signalR.HubConnectionState.Disconnected;
}

export function isMessagingHubOnline() {
  return getMessagingHubState() === signalR.HubConnectionState.Connected;
}

export async function connectMessagingHub(nextHandlers = {}) {
  handlers = nextHandlers;

  if (connection?.state === signalR.HubConnectionState.Connected) {
    wireHandlers(connection);
    return connection;
  }

  if (connection?.state === signalR.HubConnectionState.Connecting) {
    wireHandlers(connection);
    return connection;
  }

  if (connection) {
    try {
      await connection.stop();
    } catch {
      // ignore stop errors during reconnect
    }
    connection = null;
  }

  const token = getAccessToken();
  if (!token) return null;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(resolveHubUrl(), {
      accessTokenFactory: () => getAccessToken(),
      skipNegotiation: false,
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  wireHandlers(connection);

  connection.onreconnected(() => {
    handlers.onReconnected?.();
    rejoinActiveChats();
  });

  connection.onclose(() => {
    handlers.onDisconnected?.();
  });

  await connection.start();
  await rejoinActiveChats();
  handlers.onConnected?.();
  return connection;
}

export async function reconnectMessagingHub() {
  const token = getAccessToken();
  if (!token) return disconnectMessagingHub();

  const state = getMessagingHubState();
  if (state === signalR.HubConnectionState.Connected) {
    await rejoinActiveChats();
    return connection;
  }

  if (state === signalR.HubConnectionState.Connecting) return connection;

  try {
    return await connectMessagingHub(handlers);
  } catch {
    return null;
  }
}

export async function joinMessagingChat(chatId) {
  if (!chatId) return;
  joinedChats.add(String(chatId));

  if (!connection || connection.state !== signalR.HubConnectionState.Connected) return;

  try {
    await connection.invoke("JoinChat", chatId);
  } catch {
    // hub may reconnect and rejoin automatically
  }
}

export async function leaveMessagingChat(chatId) {
  if (!chatId) return;
  joinedChats.delete(String(chatId));

  if (!connection || connection.state !== signalR.HubConnectionState.Connected) return;

  try {
    await connection.invoke("LeaveChat", chatId);
  } catch {
    // ignore leave errors
  }
}

export async function disconnectMessagingHub() {
  joinedChats.clear();
  handlers = {};

  if (!connection) return;

  try {
    await connection.stop();
  } catch {
    // ignore stop errors
  } finally {
    connection = null;
  }
}
