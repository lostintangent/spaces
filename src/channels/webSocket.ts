import { eventChannel } from "redux-saga";
import { LiveShare } from "vsls";
import { ChatApi } from "../chatApi";
import ws from "../ws";

export function createWebSocketChannel(api: LiveShare, chatApi: ChatApi) {
  return eventChannel((emit: Function) => {
    ws.init(api.session.user!.emailAddress!, (data: any) => {
      const { name, members, sessions, messages } = data;
      chatApi.onMessageReceived(name, messages);

      emit({ name, members, sessions });
    });

    return () => {
      // ws.init will reinit the WebSocket, so there's
      // no need to dispose anything here
    };
  });
}
