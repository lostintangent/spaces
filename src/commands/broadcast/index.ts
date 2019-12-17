import { Store } from "redux";
import { LiveShare } from "vsls";
import { initializeGitListeners } from "../../git";
import { initLiveShare } from "../../liveshare";
import { registerCommand } from "../common/registerCommand";
import { registerBranchForBroadcastFactory } from "./registerBranch";

export const registerBranchBroadcastCommands = async (
  api: LiveShare,
  store: Store
) => {
  await initLiveShare(store, api);
  await initializeGitListeners(store);

  registerCommand(
    "liveshare.registerFeatureBranchForBroadcast",
    registerBranchForBroadcastFactory(store)
  );
};
