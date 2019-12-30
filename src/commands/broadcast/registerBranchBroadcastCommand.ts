import { Store } from "redux";
import * as vscode from "vscode";
import { Access } from "vsls";
import { CommandId } from "../../constants";
import { CancellationError } from "../../errors/CancellationError";
import { createBranch, getCurrentBranch, getUserName, isBranchExist, switchToTheBranch } from "../../git";
import { addBranchBroadcast, getBranchBroadcast, removeBranchBroadcast } from "../../store/actions/branchBroadcastsActions";
import { ISpace, IStore } from "../../store/model";
import { Branch } from "../../typings/git";
import { randomInt } from "../../utils/randomInt";
import { startLiveShareSession } from "./liveshare";

export interface IRegisterBranchOptions { }

const getBranchName = (branch: Branch): [string, [number, number]] => {
  const { name } = branch;

  const setName = name!;

  const cleanBranchName = setName.trim().toLowerCase();

  if (cleanBranchName !== "master") {
    return [setName, [0, 0]];
  }

  const gitUsername = getUserName() || "";

  if (!gitUsername) {
    return ["", [0, 0]];
  }

  const cleanUserName = gitUsername
    .trim()
    .toLowerCase()
    .replace(/\s/, "-");

  return [
    `${cleanUserName}/feature-${randomInt()}`,
    [gitUsername.length + 1, 90]
  ];
};

export const spacesToPickerOptions = (spaces: ISpace[]) => {
  const result = spaces.map(space => {
    return {
      label: space.name,
      space
    };
  });

  return result;
};

const registerTheBranchAndAskToSwitch = async (
  store: Store,
  branchName: string,
  description: string | undefined,
  space: ISpace
) => {
  await addBranchBroadcast({
    branchName,
    spaceName: space.name,
    description: description || "",
    access: Access.Owner
  });

  const currentBranch = getCurrentBranch();

  const buttonPrefix =
    !currentBranch || currentBranch.name !== branchName ? "Switch & " : "";

  const startButton = `${buttonPrefix}Start Broadcasting`;

  const answer = await vscode.window.showInformationMessage(
    `The "${branchName}" was successfully registered for broadcast.`,
    startButton
  );

  if (answer === startButton) {
    // If git branches need to be switched, do that.
    // The LS session start/end will be handled automatically.
    if (!currentBranch || currentBranch.name! !== branchName) {
      await switchToTheBranch(branchName);
      // if already on required branch, start LS session
    } else {
      const branchRecord = getBranchBroadcast(branchName);

      if (!branchRecord) {
        throw new Error("Branch is registered but not found.");
      }

      await startLiveShareSession(store, branchRecord);
    }
  }
};

export const registerBranchForBroadcastCommandFactory = (store: Store) => {
  return async (options: IRegisterBranchOptions = {}) => {
    const currentBranch = getCurrentBranch();

    if (!currentBranch) {
      throw new Error("Please open a repo to start with.");
    }

    const [value, selection] = getBranchName(currentBranch);
    const inputMessage = "Select Branch for Broadcast";
    const branch = await vscode.window.showInputBox({
      prompt: inputMessage,
      value,
      valueSelection: selection
    });

    if (!branch) {
      throw new CancellationError("No branch selected.");
    }

    const featureBranch = branch.trim().toLowerCase();

    const existingBranchBroadcast = getBranchBroadcast(featureBranch);
    if (existingBranchBroadcast) {
      const yesButton = "Register again";
      const answer = await vscode.window.showInformationMessage(
        `The branch "${featureBranch}" is already registered for broadcast. Do you want to update the registration?`,
        yesButton
      );
      if (answer !== yesButton) {
        return;
      }

      await removeBranchBroadcast(featureBranch);
    }

    /**
     * If branch is `master` we need to conferm the user intention.
     */
    if (featureBranch === "master") {
      const yesButton = "Broadcast \"master\" branch";
      const answer = await vscode.window.showInformationMessage(
        "Are you sure you want to broadcast \"master\" branch?",
        yesButton
      );

      if (!answer) {
        return await vscode.commands.executeCommand(
          CommandId.registerBranchForBroadcast
        );
      }
    }

    const description = await vscode.window.showInputBox({
      prompt: "Describe what you want to build in this branch"
    });

    const { spaces } = <IStore>store.getState();
    const spacesQuestionResult = await vscode.window.showQuickPick(
      spacesToPickerOptions(spaces.spaces),
      {
        placeHolder: "Select a space to broadcast to"
      }
    );

    if (!spacesQuestionResult) {
      throw new CancellationError("No Space selected.");
    }

    const { space } = spacesQuestionResult;

    /**
     * If feature branch is present we don't have to create it.
     */
    const isBranchPresent = await isBranchExist(featureBranch);
    if (isBranchPresent) {
      return await registerTheBranchAndAskToSwitch(
        store,
        featureBranch,
        description,
        space
      );
    }

    /**
     * If feature branch not the current one and current one is not master, we need to confirm user intention.
     */
    const currentBranchName = currentBranch.name!.toLowerCase();
    let fromBranch = "master";
    if (featureBranch !== currentBranchName && currentBranchName !== "master") {
      const message = `Are you sure you want to start the feature branch not from master branch?`;
      const masterOption = "Start from \"master\"";
      const featureBranchOption = `Start from "${currentBranchName}"`;
      const pickerOptions = [masterOption, featureBranchOption];
      const answer = await vscode.window.showQuickPick(pickerOptions, {
        placeHolder: message
      });

      if (!answer) {
        throw new CancellationError("The feature branch registration was cancelled.");
      }

      fromBranch = answer === masterOption ? "master" : featureBranch;
    }

    const isShouldSwitchBranch = currentBranchName !== fromBranch;
    await createBranch(
      featureBranch,
      isShouldSwitchBranch,
      currentBranchName,
      fromBranch
    );

    return await registerTheBranchAndAskToSwitch(
      store,
      featureBranch,
      description,
      space
    );
  };
};
