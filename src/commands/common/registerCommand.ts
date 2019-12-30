import * as vscode from "vscode";
import { IRegisterBranchOptions } from "../broadcast/registerBranchBroadcastCommand";
import { createCommand } from "./createCommand";

export async function registerCommand(
  name: "liveshare.registerBranchBroadcast",
  command: (options?: IRegisterBranchOptions) => void
): Promise<void>;

export async function registerCommand(
  name: "liveshare.unregisterBranchBroadcast",
  command: () => void
): Promise<void>;

export async function registerCommand(
  name: "liveshare.unregisterAllBranchBroadcasts",
  command: () => void
): Promise<void>;

export async function registerCommand(name: any, command: any) {
  const wrappedCommand = createCommand(command);
  vscode.commands.registerCommand(name, wrappedCommand);
}
