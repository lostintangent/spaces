import { Store } from "redux";
import { LiveShare } from "vsls";
import { ISessionStateChannel } from "../../channels/sessionState";
import { registerCommand } from "../common/registerCommand";
import { startListenOnBranchChange } from "./git";
import { initLiveShare } from "./liveshare";
import { registerBranchForBroadcastCommandFactory } from "./registerBranchBroadcastCommand";
import { unregisterBranchBroadcastCommandFactory } from "./unregisterBranchBroadcastCommand";

export const registerBranchBroadcastCommands = async (
  api: LiveShare,
  store: Store,
  sessionStateChannel: ISessionStateChannel
) => {
  await initLiveShare(store, api);
  await startListenOnBranchChange(store, sessionStateChannel);

  registerCommand(
    "liveshare.registerBranchBroadcast",
    registerBranchForBroadcastCommandFactory(store)
  );

  registerCommand(
    "liveshare.unregisterBranchBroadcast",
    unregisterBranchBroadcastCommandFactory(sessionStateChannel)
  );
};
