import * as vscode from "vscode";
import { CancellationError } from "../../errors/CancellationError";
import { log } from "../../logger";

export const createCommand = (command: Function) => {
  return async function (...args: any[]) {
    try {
      await command(...args);
    } catch (e) {
      log.error(e);

      if (e instanceof CancellationError) {
        return await vscode.window.showInformationMessage(e.message);
      }

      await vscode.window.showErrorMessage(e.message);
    }
  };
};
