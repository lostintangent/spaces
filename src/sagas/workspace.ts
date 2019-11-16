import * as fs from "fs";
import { call, put } from "redux-saga/effects";
import { URL } from "url";
import { window, workspace } from "vscode";
import { config, SuggestionBehavior } from "../config";
import { LocalStorage } from "../storage/LocalStorage";
import { joinSpace, leaveSpace } from "../store/actions";

const CONFIG_FILE_NAME = ".space";

export function* workspaceSaga(storage: LocalStorage) {
  if (!workspace.workspaceFolders) return;

  const contributionBehavior = config.workspaceSuggestionBehavior;
  if (contributionBehavior === SuggestionBehavior.ignore) return;

  const configPath = new URL(
    CONFIG_FILE_NAME,
    workspace.workspaceFolders[0].uri.toString() + "/"
  );

  if (!fs.existsSync(configPath)) return;

  const spaceName = fs.readFileSync(configPath, "utf8");
  if (!spaceName) return;

  const existingSpaces = storage.getSpaces();
  if (existingSpaces.includes(spaceName)) return;

  if (contributionBehavior === SuggestionBehavior.prompt) {
    const response = yield call(
      // @ts-ignore
      window.showInformationMessage,
      `This workspace suggests you join the "${spaceName}" Live Share space.`,
      "Join"
    );

    if (response !== "Join") return;
  }

  yield put(joinSpace(spaceName));

  if (contributionBehavior === SuggestionBehavior.join) {
    const response = yield call(
      // @ts-ignore
      window.showInformationMessage,
      `You've joined the "${spaceName}" Live Share space based on this workspace's suggestion.`,
      "Leave"
    );

    if (response === "Leave") {
      yield put(leaveSpace(spaceName));
    }
  }

  // TODO: Setup a file watcher for config changes
  // TODO: Check for new workspaces that are open during a VSC session
}
