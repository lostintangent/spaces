import { Store } from "redux";
import { LiveShare } from "vsls";
import { ISessionStateChannel } from "../channels/sessionState";
import { LocalStorage } from "../storage/LocalStorage";
import { registerCommunityCommands } from "./communities";
import { registerInvitationCommands } from "./invitations";
import { registerSessionCommands } from "./sessions";

export function registerCommands(
  api: LiveShare,
  store: Store,
  storage: LocalStorage,
  extensionPath: string,
  sessionStateChannel: ISessionStateChannel
) {
  registerCommunityCommands(api, store, storage, extensionPath);
  registerSessionCommands(store, sessionStateChannel);
  registerInvitationCommands(api);
}
