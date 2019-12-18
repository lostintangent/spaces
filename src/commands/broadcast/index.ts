import { Store } from "redux";
import { LiveShare } from "vsls";
import { registerCommand } from "../common/registerCommand";
import { startListenOnBranchChange } from "./git";
import { initLiveShare } from "./liveshare";
import { registerBranchForBroadcastFactory } from "./registerBranchForBroadcast";

export const registerBranchBroadcastCommands = async (
  api: LiveShare,
  store: Store
) => {
  await initLiveShare(store, api);
  await startListenOnBranchChange(store);

  registerCommand(
    "liveshare.registerFeatureBranchForBroadcast",
    registerBranchForBroadcastFactory(store)
  );
};
