import { call, put, take } from "redux-saga/effects";
import { window } from "vscode";
import {
  createExtensionsChannel,
  ExtensionEventType
} from "../channels/extensions";
import { config, SuggestionBehavior } from "../config";
import { LocalStorage } from "../storage/LocalStorage";
import { joinSpace, leaveSpace } from "../store/actions";

enum PromptResponse {
  dontAskAgain = "Don't Ask Again",
  join = "Join",
  leave = "Leave"
}

export function* extensionsSaga(storage: LocalStorage) {
  const extensionsChannel = createExtensionsChannel();

  while (true) {
    const { id, type, spaces } = yield take(extensionsChannel);

    const isAddedEvent = type === ExtensionEventType.extensionAdded;
    const existingSpaces: string[] = storage.getSpaces();

    for (let space of spaces) {
      const spaceExists = existingSpaces.find(s => s === space);

      if (isAddedEvent && !spaceExists) {
        const contributionBehavior = config.extensionSuggestionBehavior;
        if (contributionBehavior === SuggestionBehavior.ignore) {
          continue;
        } else if (contributionBehavior === SuggestionBehavior.prompt) {
          const response = yield call(
            // @ts-ignore
            window.showInformationMessage,
            `The "${id}" extension recommends you join the "${space}" Live Share space.`,
            PromptResponse.dontAskAgain,
            PromptResponse.join
          );

          if (!response) {
            continue;
          } else if (response === PromptResponse.dontAskAgain) {
            config.extensionSuggestionBehavior = SuggestionBehavior.ignore;
            continue;
          }
        }

        yield put(joinSpace(space));

        if (contributionBehavior === SuggestionBehavior.join) {
          const response = yield call(
            // @ts-ignore
            window.showInformationMessage,
            `You've joined the "${space}" Live Share space based on the recommendation from "${id}".`,
            PromptResponse.leave
          );

          if (response === PromptResponse.leave) {
            yield put(leaveSpace(space));
          }
        }
      } else if (!isAddedEvent && spaceExists) {
        yield put(leaveSpace(space));
      }
    }
  }
}
