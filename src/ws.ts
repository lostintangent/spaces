import * as WebSocket from "ws";

const BASE_URL = "http://vslscommunitieswebapp.azurewebsites.net";

let isAlive = false;

export function init(userEmail: string, callback: any) {
  const ws = new WebSocket(`${BASE_URL}/ws?${userEmail}`);

  ws.on("open", () => {
    isAlive = true;
  });

  ws.on("pong", () => {
    isAlive = true;
  });

  setInterval(() => {
    if (!isAlive) {
      // TODO: Reconnection logic
    }

    isAlive = false;
    ws.ping("{}");
  }, 10000);
  
  ws.on("message", function incoming(data: any) {
    callback(JSON.parse(data));
  });
}
