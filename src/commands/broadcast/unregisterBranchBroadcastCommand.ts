import * as vscode from "vscode";
import { ISessionStateChannel } from "../../channels/sessionState";
import { CancellationError } from "../../errors/CancellationError";
import { getCurrentBranch } from "../../git";
import { getBranchBroadcasts, removeBranchBroadcast } from "../../store/actions/branchBroadcastsActions";
import { IBranchBroadcastRecord } from "../../store/model";
import { stopLiveShareSession } from "./liveshare";

const branchesToPickerOptions = (branches: IBranchBroadcastRecord[]) => {
  const result = branches.map(branch => {
    return {
      label: branch.branchName,
      branch
    };
  });

  return result;
};

export const unregisterBranchBroadcastCommandFactory = (
  sessionStateChannel: ISessionStateChannel
) => {
  return async () => {
    const registeredBranches = getBranchBroadcasts();

    if (!registeredBranches.length) {
      vscode.window.showInformationMessage("No branch broadcasts found.");
      return;
    }

    const spacesQuestionResult = await vscode.window.showQuickPick(
      branchesToPickerOptions(registeredBranches),
      {
        placeHolder: "Select branch to unregister",
        canPickMany: true
      }
    );

    if (!spacesQuestionResult) {
      throw new CancellationError("Unregister branch broadcast cancelled.");
    }

    for (let answerBranch of spacesQuestionResult) {
      const { branchName } = answerBranch.branch;
      removeBranchBroadcast(branchName);
    }

    vscode.window.showInformationMessage(
      `Branch(es) successfully unregistered from broadcast.`
    );

    const currentBranch = getCurrentBranch();

    if (!currentBranch) {
      return;
    }

    const isCurrentBranchOnTheList = spacesQuestionResult.find(pickerOption => {
      return pickerOption.branch.branchName === currentBranch.name!;
    });

    if (isCurrentBranchOnTheList) {
      await stopLiveShareSession(true, sessionStateChannel);
    }
  };
};
