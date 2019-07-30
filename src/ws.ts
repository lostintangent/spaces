import * as WebSocket from "ws";

const BASE_URL = "http://vslscommunitieswebapp.azurewebsites.net";

export class WebsocketClient {
    wsUrl: string;
    ws: WebSocket | undefined;
    pingTimer: NodeJS.Timer | undefined;

    constructor(userEmail: string, private callback: any) {
        this.wsUrl = `${BASE_URL}/ws?${userEmail}`;
    }

    init() {
        console.log("Websocket connecting");
        this.ws = new WebSocket(this.wsUrl);

        this.ws.on("open", () => {
            console.log("Websocket open");
            this.pingTimer = setInterval(() => {
                this.ws!.send("ping");
            }, 7500)
        })

        this.ws.on("close", (code, reason) => {
            console.log("Websocket closed")
            this.initiateReconnection();
        });

        this.ws.on("message", (data: any) => {
            this.callback(JSON.parse(data));
        })
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
