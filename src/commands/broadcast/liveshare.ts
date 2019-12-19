import { Store } from "redux";
import * as vscode from "vscode";
import { Access, LiveShare } from "vsls";
import { ISessionStateChannel } from "../../channels/sessionState";
import { getCurrentBranch } from "../../git";
import { log } from "../../logger";
import { createSession } from "../../store/actions";
import {
  getBranchBroadcast,
  removeBranchBroadcast,
  setBranchBroadcastExplicitlyStopped
} from "../../store/actions/branchBroadcastsActions";
import { IBranchBroadcastRecord, SessionType } from "../../store/model";

let lsAPI: LiveShare | null = null;

export interface IStartLiveShareSessionOptions {
  space: string;
  type: SessionType;
  description: string;
  access: Access;
}

export const startLiveShareSession = (
  store: Store,
  branchRecord: IBranchBroadcastRecord
) => {
  const { spaceName, description } = branchRecord;
  store.dispatch(
    createSession(spaceName, SessionType.Broadcast, description, Access.Owner)
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

    startLiveShareSession(store, branchRegistryData);
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
  isIgnoreEndEvent = isIgnoreSessionEndEvent;

  try {
    await sessionStateChannel.endActiveSession();
  } catch (e) {
    log.info(e);
  } finally {
    isIgnoreEndEvent = false;
  }
};
