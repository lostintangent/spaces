import { channel, Channel } from "redux-saga";
import { LiveShare } from "vsls";

export interface ISessionStateChannel extends Channel<boolean> {
  endActiveSession: () => Promise<void>;
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
    endActiveSession: async (): Promise<void> => {
      if (api.session.id) {
        await api.end();
      } else {
        sessionChannel.put(false);
      }
    }
  };
}
