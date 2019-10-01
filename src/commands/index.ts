import { Store } from "redux";
import { LiveShare } from "vsls";
import { ISessionStateChannel } from "../channels/sessionState";
import { LocalStorage } from "../storage/LocalStorage";
import { registerInvitationCommands } from "./invitations";
import { registerSessionCommands } from "./sessions";
import { registerSpaceCommands } from "./spaces";

export function registerCommands(
  api: LiveShare,
  store: Store,
  storage: LocalStorage,
  extensionPath: string,
  sessionStateChannel: ISessionStateChannel,
  joinRequest: Function
) {
  registerSpaceCommands(api, store, storage, extensionPath);
  registerSessionCommands(store, sessionStateChannel);
  registerInvitationCommands(api, joinRequest);
}
