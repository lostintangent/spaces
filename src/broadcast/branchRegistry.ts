import * as vscode from "vscode";
import { ISpace } from "../store/model";

interface IRegistryData {
  isRunning: boolean;
  isExplicitellyStopped: boolean;
  spaceName: string;
}

const defaultRegistryData: IRegistryData = {
  isRunning: false,
  isExplicitellyStopped: false,
  spaceName: ""
};

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
): IRegistryData | undefined => {
  if (!memento) {
    throw new Error(
      "The memento storage is not initialized. Please call `initializeBranchRegistry()` first."
    );
  }

  const registryData = memento.get<IRegistryData | undefined>(
    getBranchRecordName(branchName)
  );

  if (!registryData) {
    return undefined;
  }

  return {
    ...defaultRegistryData,
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
    ...defaultRegistryData,
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
    ...defaultRegistryData,
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
    ...defaultRegistryData,
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
    ...defaultRegistryData,
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
    ...defaultRegistryData,
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

  return !!(registryData && registryData.isExplicitellyStopped);
};
