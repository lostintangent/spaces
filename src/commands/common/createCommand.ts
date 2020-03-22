import * as vscode from "vscode";
import { CancellationError } from "../../errors/CancellationError";
import { log } from "../../logger";

export const createCommand = (command: Function) => {
  return async function (...args: any[]) {
    try {
      await command(...args);
    } catch (e) {
      log.error(e);

      const isCancellationError = (e instanceof CancellationError);
      if (!isCancellationError) {
        await vscode.window.showErrorMessage(e.message);
      }
    }
  };
};
