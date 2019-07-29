import * as WebSocket from "ws";

const BASE_URL = "http://vslscommunitieswebapp.azurewebsites.net";

export class WebsocketClient {
  wsUrl: string;
  ws: WebSocket | undefined;
  isAlive: boolean = false;
  pingTimer: NodeJS.Timer | undefined;

  constructor(userEmail: string, private callback: any) {
    this.wsUrl = `${BASE_URL}/ws?${userEmail}`;
  }

  init() {
    console.log("Websocket connecting");
    this.ws = new WebSocket(this.wsUrl);
    this.ws.on("open", () => this.receivedHeartbeat())
    this.ws.on("pong", () => this.receivedHeartbeat())
    this.ws.on("close", (code, reason) => {
      console.log("Websocket closed")
      this.initiateReconnection();
    });

    this.pingTimer = setInterval(() => {
      if (!this.isAlive) {
        console.log("Websocket disconnected");
        this.initiateReconnection();
      }

      this.isAlive = false;
      this.ws!.send("ping"); // We are sending a ping as a message
    }, 5000)

    this.ws.on("message", (data: any) => {
      this.callback(JSON.parse(data));
      this.receivedHeartbeat();
    })
  }

  receivedHeartbeat() {
    this.isAlive = true;
  }

  initiateReconnection() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
    }

    setTimeout(() => {
      this.init()
    }, 5000)
  }
}
