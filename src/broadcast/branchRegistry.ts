import * as vscode from "vscode";
import { IBranchBroadcastRecord, ISpace } from "../store/model";
import { defaultBranchBroadcastRecord } from "../store/reducers/branchBroadcastsReducer";

export interface IBranchRegistrationOptions {
  branchName: string;
  space: ISpace;
}

let memento: vscode.Memento | null = null;

export const initializeBranchRegistry = (context: vscode.ExtensionContext) => {
  memento = context.globalState;
};

export const getBranchRegistryRecord = (
  branchName: string
): IBranchBroadcastRecord | undefined => {
  if (!memento) {
    throw new Error(
      "The memento storage is not initialized. Please call `initializeBranchRegistry()` first."
    );
  }

  const registryData = memento.get<IBranchBroadcastRecord | undefined>(
    getBranchRecordName(branchName)
  );

  if (!registryData) {
    return undefined;
  }

  return {
    ...defaultBranchBroadcastRecord,
    ...registryData
  };
};

const BRANCH_REGISTRY_PREFIX = "tgzr.branch.registry.";

const getBranchRecordName = (branchName: string) => {
  return `${BRANCH_REGISTRY_PREFIX}${branchName}`;
};
export const registerBranch = async (options: IBranchRegistrationOptions) => {
  if (!memento) {
    throw new Error(
      "The memento storage is not initialized. Please call `initializeBranchRegistry()` first."
    );
  }
  const { branchName, space } = options;

  const registryData = getBranchRegistryRecord(branchName);

  if (registryData) {
    return;
  }

  memento.update(getBranchRecordName(branchName), {
    ...defaultBranchBroadcastRecord,
    spaceName: space.name
  });
};

export const unregisterBranch = async (branchName: string) => {
  if (!memento) {
    throw new Error(
      "The memento storage is not initialized. Please call `initializeBranchRegistry()` first."
    );
  }

  memento.update(getBranchRecordName(branchName), undefined);
};

export const isBranchAlreadyRegistered = (branchName: string) => {
  if (!memento) {
    throw new Error(
      "The memento storage is not initialized. Please call `initializeBranchRegistry()` first."
    );
  }

  const registryData = getBranchRegistryRecord(branchName);

  return !!registryData;
};

export const setBranchRunning = (branchName: string) => {
  if (!memento) {
    throw new Error(
      "The memento storage is not initialized. Please call `initializeBranchRegistry()` first."
    );
  }

  const registryData = {
    ...defaultBranchBroadcastRecord,
    ...getBranchRegistryRecord(branchName),
    isRunning: true
  };

  memento.update(getBranchRecordName(branchName), registryData);
};

export const setBranchStopped = (branchName: string) => {
  if (!memento) {
    throw new Error(
      "The memento storage is not initialized. Please call `initializeBranchRegistry()` first."
    );
  }

  const registryData = {
    ...defaultBranchBroadcastRecord,
    ...getBranchRegistryRecord(branchName),
    isRunning: false
  };

  memento.update(getBranchRecordName(branchName), registryData);
};

export const setBranchExplicitelyStopped = (branchName: string) => {
  if (!memento) {
    throw new Error(
      "The memento storage is not initialized. Please call `initializeBranchRegistry()` first."
    );
  }

  const registryData = {
    ...defaultBranchBroadcastRecord,
    ...getBranchRegistryRecord(branchName),
    isExplicitellyStopped: true
  };

  memento.update(getBranchRecordName(branchName), registryData);
};

export const resetBranchExplicitelyStopped = (branchName: string) => {
  if (!memento) {
    throw new Error(
      "The memento storage is not initialized. Please call `initializeBranchRegistry()` first."
    );
  }

  const registryData = {
    ...defaultBranchBroadcastRecord,
    ...getBranchRegistryRecord(branchName),
    isExplicitellyStopped: false
  };

  memento.update(getBranchRecordName(branchName), registryData);
};

export const isBranchExplicitellyStopped = (branchName: string) => {
  if (!memento) {
    throw new Error(
      "The memento storage is not initialized. Please call `initializeBranchRegistry()` first."
    );
  }

  const registryData = getBranchRegistryRecord(branchName);

  return !!(registryData && registryData.isExplicitlyStopped);
};
