import * as WebSocket from "ws";

const BASE_URL = "http://vslscommunitieswebapp.azurewebsites.net";

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
        this.ws = new WebSocket(`${BASE_URL}/ws?${this.userEmail}`);

        this.ws.on("open", () => {
            console.log("Websocket open");
            this.pingTimer = setInterval(() => {
                const pingMessage = {type: "ping"}
                this.ws!.send(JSON.stringify(pingMessage));
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

    sendMessage(communityName: string, content: string) {
        const message = {type: "message", content, name: communityName}

        if (this.ws) {
            this.ws.send(JSON.stringify(message))
        }
    }

    initiateReconnection() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer)
        }

        setTimeout(() => {
            this.connect()
        }, 5000)
    }
}

export default new WebsocketClient();
