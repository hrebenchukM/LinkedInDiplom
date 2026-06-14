import * as signalR from "@microsoft/signalr";

const API = "http://localhost:5282";

async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data?.token?.accessToken) throw new Error(`Login failed for ${email}`);
  return data.token.accessToken;
}

const tokenA = await login("admin@local.dev", "Admin123!");
const tokenB = await login("andrii.rotar@gmail.com", "LinkUpDemo2024!");

const chatRes = await fetch(`${API}/api/messaging/me/chats`, {
  method: "POST",
  headers: { Authorization: `Bearer ${tokenA}`, "Content-Type": "application/json" },
  body: "{}",
});
const chatJson = await chatRes.json();
const chatId = chatJson.chat.id;

await fetch(`${API}/api/messaging/me/chats/${chatId}/join`, {
  method: "POST",
  headers: { Authorization: `Bearer ${tokenB}`, "Content-Type": "application/json" },
  body: "{}",
});

let receivedOnB = false;
const connectionB = new signalR.HubConnectionBuilder()
  .withUrl(`${API}/hubs/messaging`, { accessTokenFactory: () => tokenB })
  .withAutomaticReconnect()
  .build();

connectionB.on("MessageCreated", (msg) => {
  if (String(msg.content).includes("signalr-live-test")) {
    receivedOnB = true;
    console.log("REALTIME_OK received on B:", msg.content);
  }
});

await connectionB.start();
await connectionB.invoke("JoinChat", chatId);

await fetch(`${API}/api/messaging/me/chats/${chatId}/messages`, {
  method: "POST",
  headers: { Authorization: `Bearer ${tokenA}`, "Content-Type": "application/json" },
  body: JSON.stringify({ content: "signalr-live-test-from-A" }),
});

await new Promise((r) => setTimeout(r, 2000));

await connectionB.stop();
console.log(receivedOnB ? "SIGNALR_TEST=PASS" : "SIGNALR_TEST=FAIL");
process.exit(receivedOnB ? 0 : 1);
