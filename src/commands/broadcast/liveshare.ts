import { Store } from "redux";
import * as vscode from "vscode";
import { Access, LiveShare } from "vsls";
import { ISessionStateChannel } from "../../channels/sessionState";
import { getCurrentBranch } from "../../git";
import { createSession } from "../../store/actions";
import {
  getBranchBroadcast,
  removeBranchBroadcast,
  setBranchBroadcastExplicitlyStopped
} from "../../store/actions/branchBroadcastsActions";
import { SessionType } from "../../store/model";

let lsAPI: LiveShare | null = null;

export interface IStartLiveShareSessionOptions {
  space: string;
  type: SessionType;
  description: string;
  access: Access;
}

export const startLiveShareSession = (store: Store, spaceName: string) => {
  store.dispatch(
    createSession(spaceName, SessionType.Broadcast, "", Access.Owner)
  );
};

const handleSessionStart = (store: Store) => {
  const currentBranch = getCurrentBranch();

  if (!currentBranch) {
    return;
  }

  const existingBranchBroadcast = getBranchBroadcast(currentBranch.name!);
  if (existingBranchBroadcast && existingBranchBroadcast.isExplicitlyStopped) {
    setBranchBroadcastExplicitlyStopped(currentBranch.name!, false);
  }
};

const handleSessionEnd = async (store: Store) => {
  const currentBranch = getCurrentBranch();
  if (!currentBranch) {
    throw new Error("Branch is running but no current branch found.");
  }
  setBranchBroadcastExplicitlyStopped(currentBranch.name!, true);
  const unregisterButton = "Unregister branch";
  const resumeButton = "Resume branch";
  const answer = await vscode.window.showInformationMessage(
    "The automatic branch broadcast paused, Live Share to resume the branch broadcast.",
    unregisterButton,
    resumeButton
  );

  if (answer === unregisterButton) {
    removeBranchBroadcast(currentBranch.name!);
  }

  if (answer === resumeButton) {
    setBranchBroadcastExplicitlyStopped(currentBranch.name!, false);
    const branchRegistryData = getBranchBroadcast(currentBranch.name!);
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
  isIgnoreSessionEndEvent: boolean,
  sessionStateChannel: ISessionStateChannel
) => {
  // if (!lsAPI) {
  //   throw new Error("No Live Share API found. Call `initLiveShare` first.");
  // }

  // if (!lsAPI.session.id) {
  //   return;
  // }

  isIgnoreEndEvent = isIgnoreSessionEndEvent;

  try {
    await sessionStateChannel.endActiveSession();
    // const result = await lsAPI.end();
    // console.log(result);
  } catch (e) {
    console.log(e);
  } finally {
    isIgnoreEndEvent = false;
  }
};
