import * as WebSocket from "ws";
import { config } from "./config";

export class WebsocketClient {
  ws: WebSocket | undefined;
  userEmail: string | undefined;
  callback: any;
  pingTimer: NodeJS.Timer | undefined;

  init(userEmail: string, callback: any) {
    this.userEmail = userEmail;
    this.callback = callback;
    this.connect();
  }

  connect() {
    console.log("Websocket connecting");
    this.ws = new WebSocket(`${config.serviceUri}/ws?${this.userEmail}`);

    this.ws.on("open", () => {
      console.log("Websocket open");
      this.pingTimer = setInterval(() => {
        const pingMessage = { type: "ping" };
        this.ws!.send(JSON.stringify(pingMessage));
      }, 7500);
    });

    this.ws.on("close", (code, reason) => {
      console.log("Websocket closed");
      this.initiateReconnection();
    });

    this.ws.on("error", e => {
      console.log("Websocket error: %o", e);
    });

    this.ws.on("message", (data: any) => {
      this.callback(JSON.parse(data));
    });
  }

  sendMessage(spaceName: string, content: string) {
    const message = { type: "message", content, name: spaceName };

    if (this.ws) {
      this.ws.send(JSON.stringify(message));
    }
  }

  initiateReconnection() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
    }

    setTimeout(() => {
      this.connect();
    }, 5000);
  }
}

export default new WebsocketClient();
