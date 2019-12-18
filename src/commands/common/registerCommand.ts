import * as vscode from "vscode";
import { IRegisterBranchOptions } from "../broadcast/registerBranchForBroadcast";
import { createCommand } from "./createCommand";

export async function registerCommand(
  name: "liveshare.registerFeatureBranchForBroadcast",
  command: (options?: IRegisterBranchOptions) => void
): Promise<void>;
export async function registerCommand(name: any, command: any) {
  const wrappedCommand = createCommand(command);

  // push to context
  vscode.commands.registerCommand(name, wrappedCommand);
}
