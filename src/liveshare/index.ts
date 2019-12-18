import { Store } from "redux";
import * as vscode from "vscode";
import { Access, LiveShare } from "vsls";
import {
  getBranchRegistryRecord,
  isBranchExplicitellyStopped,
  resetBranchExplicitelyStopped,
  setBranchExplicitelyStopped,
  unregisterBranch
} from "../broadcast/branchRegistry";
import { getCurrentBranch } from "../git";
import { createSession } from "../store/actions";
import { SessionType } from "../store/model";

let lsAPI: LiveShare | null = null;

export interface IStartLiveShareSessionOptions {
  space: string;
  type: SessionType;
  description: string;
  access: Access;
}

export const startLiveShareSession = (store: Store, spaceName: string) => {
  store.dispatch(
    <any>createSession(spaceName, SessionType.Broadcast, "", Access.Owner)
  );
};

const handleSessionStart = (store: Store) => {
  const currentBranch = getCurrentBranch();

  if (!currentBranch) {
    return;
  }

  if (isBranchExplicitellyStopped(currentBranch.name!)) {
    resetBranchExplicitelyStopped(currentBranch.name!);
  }
};

const handleSessionEnd = async (store: Store) => {
  const currentBranch = getCurrentBranch();
  if (!currentBranch) {
    throw new Error("Branch is running but no current branch found.");
  }
  setBranchExplicitelyStopped(currentBranch.name!);
  const unregisterButton = "Unregister branch";
  const resumeButton = "Resume branch";
  const answer = await vscode.window.showInformationMessage(
    "The automatic branch broadcast paused, Live Share to resume the branch broadcast.",
    unregisterButton,
    resumeButton
  );

  if (answer === unregisterButton) {
    unregisterBranch(currentBranch.name!);
  }

  if (answer === resumeButton) {
    resetBranchExplicitelyStopped(currentBranch.name!);
    const branchRegistryData = getBranchRegistryRecord(currentBranch.name!);
    if (!branchRegistryData) {
      return;
    }

    startLiveShareSession(store, branchRegistryData.spaceName);
  }
};

let isIgnoreEndEvent = false;

export const initLiveShare = async (store: Store, api: LiveShare) => {
  lsAPI = api;

  lsAPI.onDidChangeSession(async e => {
    if (e.session.id) {
      return handleSessionStart(store);
    }

    if (isIgnoreEndEvent) {
      return;
    }

    return await handleSessionEnd(store);
  });
};

export const stopLiveShareSession = async (
  isIgnoreSessionEndEvent: boolean
) => {
  if (!lsAPI) {
    throw new Error("No Live Share API found. Call `initLiveShare` first.");
  }

  if (!lsAPI.session.id) {
    return;
  }

  isIgnoreEndEvent = isIgnoreSessionEndEvent;

  try {
    const result = await lsAPI.end();
    console.log(result);
  } finally {
    isIgnoreEndEvent = false;
  }
};
