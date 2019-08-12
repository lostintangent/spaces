import { channel, Channel } from "redux-saga";
import { LiveShare } from "vsls";

export interface ISessionStateChannel extends Channel<boolean> {
  endActiveSession: () => void;
}

export function createSessionStateChannel(
  api: LiveShare
): ISessionStateChannel {
  const sessionChannel = channel<boolean>();

  api.onDidChangeSession(e => {
    const isSessionActive = !e.session.id;
    sessionChannel.put(isSessionActive);
  });

  return {
    ...sessionChannel,
    endActiveSession: () => {
      if (api.session.id) {
        api.end();
      } else {
        sessionChannel.put(false);
      }
    }
  };
}
