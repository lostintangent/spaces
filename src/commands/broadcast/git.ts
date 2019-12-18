import { Store } from "redux";
import * as vscode from "vscode";
import { ISessionStateChannel } from "../../channels/sessionState";
import { onBranchChange } from "../../git/onBranchChange";
import {
  getBranchBroadcast,
  removeBranchBroadcast,
  setBranchBroadcastExplicitlyStopped
} from "../../store/actions/branchBroadcastsActions";
import { startLiveShareSession, stopLiveShareSession } from "./liveshare";

export const startListenOnBranchChange = async (
  store: Store,
  sessionStateChannel: ISessionStateChannel
) => {
  onBranchChange(async ([prevBranch, currentBranch]) => {
    if (prevBranch) {
      await stopLiveShareSession(true, sessionStateChannel);
    }

    if (!currentBranch) {
      return;
    }

    const registryData = getBranchBroadcast(currentBranch);
    if (!registryData) {
      return;
    }

    if (!registryData.isExplicitlyStopped) {
      return await startLiveShareSession(store, registryData.spaceName);
    }

    if (registryData && registryData.isExplicitlyStopped) {
      const resumeButton = "Resume branch";
      const unregisterButton = "Unregister branch";
      const answer = await vscode.window.showInformationMessage(
        "This branch is registered for broadcast but explicitely paused. Do you want to resume?",
        unregisterButton,
        resumeButton
      );

      if (!answer) {
        return;
      }

      if (answer === resumeButton) {
        setBranchBroadcastExplicitlyStopped(currentBranch, false);
        return await startLiveShareSession(store, registryData.spaceName);
      }

      if (answer === unregisterButton) {
        return removeBranchBroadcast(currentBranch);
      }
    }
  });
};
