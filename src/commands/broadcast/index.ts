import { Store } from "redux";
import { LiveShare } from "vsls";
import { ISessionStateChannel } from "../../channels/sessionState";
import { registerCommand } from "../common/registerCommand";
import { startListenOnBranchChange } from "./git";
import { initLiveShare } from "./liveshare";
import { registerBranchForBroadcastFactory } from "./registerBranchForBroadcast";

export const registerBranchBroadcastCommands = async (
  api: LiveShare,
  store: Store,
  sessionStateChannel: ISessionStateChannel
) => {
  await initLiveShare(store, api);
  await startListenOnBranchChange(store, sessionStateChannel);

  registerCommand(
    "liveshare.registerFeatureBranchForBroadcast",
    registerBranchForBroadcastFactory(store)
  );
};
