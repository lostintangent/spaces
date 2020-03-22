import { Store } from "redux";
import { LiveShare } from "vsls";
import { ICallingService } from "../audio/ICallingService";
import { ISessionStateChannel } from "../channels/sessionState";
import { LocalStorage } from "../storage/LocalStorage";
import { registerBranchBroadcastCommands } from "./broadcast";
import { registerInvitationCommands } from "./invitations";
import { registerSessionCommands } from "./sessions";
import { registerSpaceCommands } from "./spaces";

export async function registerCommands(
  api: LiveShare,
  store: Store,
  storage: LocalStorage,
  extensionPath: string,
  sessionStateChannel: ISessionStateChannel,
  joinRequest: Function,
  callingService: ICallingService
) {
  registerSpaceCommands(api, store, storage, extensionPath, callingService);
  registerSessionCommands(store, sessionStateChannel);
  registerInvitationCommands(api, joinRequest);
  await registerBranchBroadcastCommands(api, store, sessionStateChannel);
}
